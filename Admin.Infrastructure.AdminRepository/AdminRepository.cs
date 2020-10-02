using Spa.Domain.SpaEntities;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;
using Newtonsoft.Json;
using Spa.InfraCommon.SpaCommon.Helpers;
using System.Linq;

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

        public List<Menu> ConsultarMenuAdmin()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarMenuAdmin";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Menu> _list_menu = _datatable.DataTableToList<Menu>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_menu;
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

        public List<Empresa> ConsultarEmpresasAdmin()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpresasAdmin";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empresa> _list_Empresas = _datatable.DataTableToList<Empresa>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_Empresas;
                }
            }
        }

        public List<Usuario> ConsultarUsuariosAdmin()
        {
            DataSet _dataset = new DataSet();
            List<Usuario> _usuarios = new List<Usuario>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUsuariosAdmin";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_dataset);

                    _dataset.Tables[0].TableName = "Usuarios";
                    _dataset.Tables[1].TableName = "Menu_Usuarios";

                    _dataset.Relations.Add("MenuUsuarios",
                   _dataset.Tables["Usuarios"].Columns["Id_Usuario"],
                   _dataset.Tables["Menu_Usuarios"].Columns["Id_Usuario"]);

                    _usuarios = _dataset.Tables["Usuarios"]
                    .AsEnumerable()
                    .Select(row =>
                    {
                        Usuario usuario = row.ToObject<Usuario>();
                        usuario.Menu_Usuario = row.GetChildRows("MenuUsuarios").DataTableToList<MenuUsuario>();
                        return usuario;
                    })
                    .ToList();

                    return _usuarios;
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

        public List<ServicioMaestro> ConsultarServiciosAdmin()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServiciosAdmin";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<ServicioMaestro> _list_Servicios = _datatable.DataTableToList<ServicioMaestro>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_Servicios;
                }
            }
        }

        public bool GuardarServicioAdmin(ServicioMaestro servicio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarServicioAdmin";
                    _command.Parameters.AddWithValue("@JsonServicio", JsonConvert.SerializeObject(servicio));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Barrio> ConsultarBarriosAdmin()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarBarriosAdmin";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Barrio> _list_Barrios = _datatable.DataTableToList<Barrio>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_Barrios;
                }
            }
        }

        public List<Departamento> ConsultarDepartamentos()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarDepartamentos";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Departamento> _list_Departamentos = _datatable.DataTableToList<Departamento>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_Departamentos;
                }
            }
        }

        public bool GuardarCategoriaServicio(CategoriaServicio categoria)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarCategoriaServicio";
                    _command.Parameters.AddWithValue("@JsonCategoriaServicio", JsonConvert.SerializeObject(categoria));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarTipoServicio(TipoServicio tiposervicio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarTipoServicio";
                    _command.Parameters.AddWithValue("@JsonTipoServicio", JsonConvert.SerializeObject(tiposervicio));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarMunicipio(Municipio municipio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarMunicipio";
                    _command.Parameters.AddWithValue("@JsonMunicipio", JsonConvert.SerializeObject(municipio));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarBarrio(Barrio barrio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarBarrio";
                    _command.Parameters.AddWithValue("@JsonBarrio", JsonConvert.SerializeObject(barrio));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }
    }
}
