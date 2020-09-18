using Spa.Domain.SpaEntities;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;
using Newtonsoft.Json;
using Spa.InfraCommon.SpaCommon.Helpers;

namespace Admin.Infrastructure.AdminRepository
{
    public class AdminRepository : IAdminRepository
    {
        protected readonly string _connectionString;

        public AdminRepository(string ConnectionString)
        {
            _connectionString = ConnectionString;
        }

        public List<CategoriaServicio> ConsultarCategoriaServicios()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarCategoriaServicios";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<CategoriaServicio> _list_categoriaServicios = _datatable.DataTableToList<CategoriaServicio>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_categoriaServicios;
                }
            }
        }

        public List<Empresa> ConsultarSedesPrincipales()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarSedesPrincipales";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empresa> _list_sedesPrincipales = _datatable.DataTableToList<Empresa>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_sedesPrincipales;
                }
            }
        }

        public List<Empresa> ConsultarTodasLasEmpresas()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarTodasLasEmpresas";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empresa> _list_Empresas = _datatable.DataTableToList<Empresa>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_Empresas;
                }
            }
        }

        public bool GuardarEmpresa(Empresa empresa)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarEmpresa";
                    _command.Parameters.AddWithValue("@JsonEmpresa", JsonConvert.SerializeObject(empresa));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }
    }
}
