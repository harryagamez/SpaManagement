using Spa.Domain.SpaEntities;
using System;
using System.Data;
using System.Data.SqlClient;
using Spa.InfraCommon.SpaCommon.Helpers;
using System.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using Spa.InfraCommon.SpaCommon.Models;

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

        public bool RegistrarActualizarCliente(List<Cliente> cliente)
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
                        _command.Parameters.AddWithValue("@JsonCliente", JsonConvert.SerializeObject(cliente));

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                        finally
                        {
                            if (_command.Connection.State == ConnectionState.Open)
                            {
                                _command.Connection.Close();
                            }

                            _command.Dispose();
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

        public bool SincronizarBarrios(List<Properties> _Properties)
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
                        _command.CommandText = "SincronizarBarrios";
                        _command.Parameters.AddWithValue("@Json", JsonConvert.SerializeObject(_Properties));

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

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }

        public List<Municipio> ConsultarMunicipios()
        {
            DataTable _datatable = new DataTable();
            List<Municipio> _listMunicipios = new List<Municipio>();
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
                        _command.CommandText = "ConsultarMunicipios";
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _listMunicipios = _datatable.DataTableToList<Municipio>();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _listMunicipios;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<Barrio> ConsultarBarrios()
        {
            DataTable _datatable = new DataTable();
            List<Barrio> _listBarrios = new List<Barrio>();
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
                        _command.CommandText = "ConsultarBarrios";
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _listBarrios = _datatable.DataTableToList<Barrio>();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _listBarrios;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<TipoCliente> ConsultarTipoClientes()
        {
            DataTable _datatable = new DataTable();
            List<TipoCliente> _listTipoClientes = new List<TipoCliente>();
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
                        _command.CommandText = "ConsultarTipoClientes";
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _listTipoClientes = _datatable.DataTableToList<TipoCliente>();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _listTipoClientes;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
