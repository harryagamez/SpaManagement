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
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _usuario;
            }
            catch
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
                        catch
                        {
                            throw;
                        }
                    }
                }

                return true;
            }
            catch
            {
                throw;
            }
        }

        public bool RegistrarActualizarCliente(List<Cliente> _Cliente)
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
                        _command.Parameters.AddWithValue("@JsonCliente", JsonConvert.SerializeObject(_Cliente));

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch
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
            catch
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
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _listMenu;
            }
            catch
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
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _clientes;
            }
            catch
            {
                throw;
            }
        }

        public bool SincronizarBarrios(List<Properties> _Properties, string _Municipio)
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
                        _command.Parameters.AddWithValue("@Municipio", _Municipio);

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return true;
            }
            catch
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
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _listMunicipios;
            }
            catch
            {
                throw;
            }
        }

        public List<Barrio> ConsultarBarrios(int IdMunicipio)
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
                        _command.Parameters.AddWithValue("@IdMunicipio", IdMunicipio);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _listBarrios = _datatable.DataTableToList<Barrio>();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _listBarrios;
            }
            catch
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
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _listTipoClientes;
            }
            catch
            {
                throw;
            }
        }

        public Cliente ConsultarCliente(string Cedula, string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            Cliente _cliente = new Cliente();
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
                        _command.CommandText = "ConsultarCliente";
                        _command.Parameters.AddWithValue("@CedulaCliente", Cedula);
                        _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _cliente = _datatable.DataTableToList<Cliente>().FirstOrDefault();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _cliente;
            }
            catch
            {
                throw;
            }
        }

        public List<TipoServicio> ConsultarTipoServicios()
        {
            DataTable _datatable = new DataTable();
            List<TipoServicio> _list_tipo_Servicios = new List<TipoServicio>();
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
                        _command.CommandText = "ConsultarTipoServicios";
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _list_tipo_Servicios = _datatable.DataTableToList<TipoServicio>();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _list_tipo_Servicios;
            }
            catch
            {
                throw;
            }
        }

        public List<Servicio> ConsultarServicios(string IdEmpresa)
        {

            DataTable _datatable = new DataTable();
            List<Servicio> _servicios= new List<Servicio>();
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
                        _command.CommandText = "ConsultarServicios";
                        _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _servicios = _datatable.DataTableToList<Servicio>();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _servicios;
            }
            catch
            {
                throw;
            }
        }

        public bool GuardarServicio(List<Servicio> _Servicio)
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
                        _command.CommandText = "GuardarServicio";
                        _command.Parameters.AddWithValue("@JsonServicio", JsonConvert.SerializeObject(_Servicio));

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch
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
            catch
            {
                throw;
            }
        }

        public List<Empleado> ConsultarEmpleados(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            List<Empleado> _empleados = new List<Empleado>();
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
                        _command.CommandText = "ConsultarEmpleados";
                        _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _empleados = _datatable.DataTableToList<Empleado>();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _empleados;
            }
            catch
            {
                throw;
            }
        }

        public List<TipoPago> ConsultarTipoPagos()
        {
            DataTable _datatable = new DataTable();
            List<TipoPago> _listTipoPagos = new List<TipoPago>();
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
                        _command.CommandText = "ConsultarTipoPagos";
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _listTipoPagos = _datatable.DataTableToList<TipoPago>();
                        }
                        catch
                        {
                            throw;
                        }
                    }
                }

                return _listTipoPagos;
            }
            catch
            {
                throw;
            }
        }
    }
}
