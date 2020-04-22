using Spa.Domain.SpaEntities;
using System;
using System.Data;
using System.Data.SqlClient;
using Spa.InfraCommon.SpaCommon.Helpers;
using System.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Spa.Infrastructure.SpaRepository
{
    public class SpaRepository : ISpaRepository
    {
        protected readonly string _connectionString;

        public SpaRepository(string ConnectionString)
        {
            _connectionString = ConnectionString;
        }

        public Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion)
        {
            DataTable _datatable = new DataTable();
            Usuario _usuario = new Usuario();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {

                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "ValidarUsuario";
                        _command.Parameters.AddWithValue("@Nombre", Nombre);
                        _command.Parameters.AddWithValue("@Password", Password);
                        _command.Parameters.AddWithValue("@ValidarIntegracion", ValidarIntegracion);
                        _command.Parameters.AddWithValue("@CodigoIntegracion", CodigoIntegracion);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _usuario;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public bool ActualizarCodigoIntegracion(int IdUsuario, string IdEmpresa, string CodigoIntegracion)
        {
            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {
                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "ActualizarCodigoIntegracion";
                        _command.Parameters.AddWithValue("@IdUsuario", IdUsuario);
                        _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                        _command.Parameters.AddWithValue("@CodigoIntegracion", CodigoIntegracion);

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public bool RegistrarActualizarCliente(Cliente cliente)
        {
            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {
                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "RegistrarActualizarCliente";
                        _command.Parameters.AddWithValue("@Cliente", JsonConvert.SerializeObject(cliente));

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<Menu> ConsultarMenu(int IdUsuario)
        {
            DataTable _datatable = new DataTable();
            List<Menu> _listMenu = new List<Menu>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {
                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "ConsultarMenu";
                        _command.Parameters.AddWithValue("@IdUsuario", IdUsuario);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _listMenu = _datatable.DataTableToList<Menu>();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _listMenu;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<Cliente> ConsultarClientes(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            List<Cliente> _clientes = new List<Cliente>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {
                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "ConsultarClientes";
                        _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _clientes = _datatable.DataTableToList<Cliente>();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _clientes;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }
}
