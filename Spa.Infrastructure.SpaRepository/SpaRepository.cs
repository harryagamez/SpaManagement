using Newtonsoft.Json;
using Spa.Domain.SpaEntities;
using Spa.Domain.SpaEntities.Extensions;
using Spa.InfraCommon.SpaCommon.Helpers;
using Spa.InfraCommon.SpaCommon.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace Spa.Infrastructure.SpaRepository
{
    public class SpaRepository : ISpaRepository
    {
        protected readonly string _connectionString;

        public SpaRepository(string ConnectionString)
        {
            _connectionString = ConnectionString;
        }

        public Usuario ValidarUsuario(string nombre, string password, bool validarIntegracion, string codigoIntegracion)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ValidarUsuario";
                    _command.Parameters.AddWithValue("@Nombre", nombre);
                    _command.Parameters.AddWithValue("@Password", password);
                    _command.Parameters.AddWithValue("@ValidarIntegracion", validarIntegracion);
                    _command.Parameters.AddWithValue("@CodigoIntegracion", codigoIntegracion);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);

                    Usuario _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _usuario;
                }
            }
        }

        public bool ActualizarCodigoIntegracion(int idUsuario, string idEmpresa, string codigoIntegracion)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ActualizarCodigoIntegracion";
                    _command.Parameters.AddWithValue("@IdUsuario", idUsuario);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@CodigoIntegracion", codigoIntegracion);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool RegistrarActualizarCliente(List<Cliente> cliente)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "RegistrarActualizarCliente";
                    _command.Parameters.AddWithValue("@JsonCliente", JsonConvert.SerializeObject(cliente));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Menu> ConsultarMenu(int idUsuario, string idEmpresa, string perfil)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarMenu";
                    _command.Parameters.AddWithValue("@IdUsuario", idUsuario);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@Perfil", perfil);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Menu> _listMenu = _datatable.DataTableToList<Menu>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listMenu;
                }
            }
        }

        public List<Cliente> ConsultarClientes(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarClientes";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Cliente> _clientes = _datatable.DataTableToList<Cliente>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _clientes;
                }
            }
        }

        public bool SincronizarBarrios(List<Properties> properties, string municipio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "SincronizarBarrios";
                    _command.Parameters.AddWithValue("@Json", JsonConvert.SerializeObject(properties));
                    _command.Parameters.AddWithValue("@Municipio", municipio);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }

        public List<Municipio> ConsultarMunicipios()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarMunicipios";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Municipio> _listMunicipios = _datatable.DataTableToList<Municipio>();

                    return _listMunicipios;
                }
            }
        }

        public List<Barrio> ConsultarBarrios(int idMunicipio)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarBarrios";
                    _command.Parameters.AddWithValue("@IdMunicipio", idMunicipio);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Barrio> _listBarrios = _datatable.DataTableToList<Barrio>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listBarrios;
                }
            }
        }

        public List<TipoCliente> ConsultarTipoClientes()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarTipoClientes";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<TipoCliente> _listTipoClientes = _datatable.DataTableToList<TipoCliente>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listTipoClientes;
                }
            }
        }

        public Cliente ConsultarCliente(string cedula, string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarCliente";
                    _command.Parameters.AddWithValue("@CedulaCliente", cedula);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    Cliente _cliente = _datatable.DataTableToList<Cliente>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _cliente;
                }
            }
        }

        public List<TipoServicio> ConsultarTipoServicios()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarTipoServicios";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<TipoServicio> _list_tipoServicios = _datatable.DataTableToList<TipoServicio>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _list_tipoServicios;
                }
            }
        }

        public List<ServicioMaestro> ConsultarServiciosMaestro(string categoriaEmpresa)
        {
            DataTable _datatable = new DataTable();
            List<ServicioMaestro> _serviciosMaestro = new List<ServicioMaestro>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServiciosMaestro";
                    _command.Parameters.AddWithValue("@CategoriaEmpresa", categoriaEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);

                    _serviciosMaestro = _datatable.DataTableToList<ServicioMaestro>();
                    return _serviciosMaestro;
                }
            }
        }

        public List<EmpresaServicio> ConsultarServicios(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            List<EmpresaServicio> _servicios = new List<EmpresaServicio>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServicios";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);

                    _servicios = _datatable.DataTableToList<EmpresaServicio>();
                    return _servicios;
                }
            }
        }

        public List<EmpresaServicio> ConsultarServiciosConImagenes(string idEmpresa)
        {
            DataSet _dataset = new DataSet();
            List<EmpresaServicio> _servicios = new List<EmpresaServicio>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServicios";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_dataset);

                    _dataset.Tables[0].TableName = "Servicios";
                    _dataset.Tables[1].TableName = "Servicio_Imagenes";

                    _dataset.Relations.Add("ServicioImagenes",
                   _dataset.Tables["Servicios"].Columns["Id_Servicio"],
                   _dataset.Tables["Servicio_Imagenes"].Columns["Id_Servicio"]);

                    _servicios = _dataset.Tables["Servicios"]
                    .AsEnumerable()
                    .Select(row =>
                    {
                        EmpresaServicio servicio = row.ToObject<EmpresaServicio>();
                        servicio.Imagenes_Servicio = row.GetChildRows("ServicioImagenes").DataTableToList<ImagenServicio>();
                        return servicio;
                    })
                    .ToList();

                    return _servicios;
                }
            }
        }

        public List<EmpresaServicio> ConsultarServiciosActivos(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            List<EmpresaServicio> _servicios = new List<EmpresaServicio>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServiciosActivos";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);

                    _servicios = _datatable.DataTableToList<EmpresaServicio>();
                    return _servicios;
                }
            }
        }

        public List<EmpresaServicio> ConsultarServiciosActivosConImagenes(string idEmpresa)
        {
            DataSet _dataset = new DataSet();
            List<EmpresaServicio> _servicios = new List<EmpresaServicio>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServiciosActivos";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_dataset);

                    _dataset.Tables[0].TableName = "Servicios";
                    _dataset.Tables[1].TableName = "Servicio_Imagenes";

                    _dataset.Relations.Add("ServicioImagenes",
                   _dataset.Tables["Servicios"].Columns["Id_Empresa_Servicio"],
                   _dataset.Tables["Servicio_Imagenes"].Columns["Id_Empresa_Servicio"]);

                    _servicios = _dataset.Tables["Servicios"]
                    .AsEnumerable()
                    .Select(row =>
                    {
                        EmpresaServicio servicio = row.ToObject<EmpresaServicio>();
                        servicio.Imagenes_Servicio = row.GetChildRows("ServicioImagenes").DataTableToList<ImagenServicio>();
                        return servicio;
                    })
                    .ToList();

                    return _servicios;
                }
            }
        }

        public bool GuardarServicio(List<EmpresaServicio> servicio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarServicio";
                    _command.Parameters.AddWithValue("@JsonServicio", JsonConvert.SerializeObject(servicio));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool EliminarImagenAdjunta(string idImagenAdjunta)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "EliminarImagenAdjunta";
                    _command.Parameters.AddWithValue("@IdImagenAdjunta", idImagenAdjunta);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Empleado> ConsultarEmpleados(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleados";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empleado> _empleados = _datatable.DataTableToList<Empleado>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleados;
                }
            }
        }

        public Empleado ConsultarEmpleado(string cedula, string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleado";
                    _command.Parameters.AddWithValue("@CedulaEmpleado", cedula);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    Empleado _empleado = _datatable.DataTableToList<Empleado>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleado;
                }
            }
        }

        public List<EmpleadoServicio> ConsultarEmpleadoServicio(int idEmpleado, string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@IdEmpleado", idEmpleado);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<EmpleadoServicio> _listEmpleadoServicio = _datatable.DataTableToList<EmpleadoServicio>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listEmpleadoServicio;
                }
            }
        }

        public List<Transaccion> ConsultarEmpleadoInsumos(int idEmpleado, string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleadoInsumos";
                    _command.Parameters.AddWithValue("@IdEmpleado", idEmpleado);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Transaccion> _listEmpleadoInsumo = _datatable.DataTableToList<Transaccion>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listEmpleadoInsumo;
                }
            }
        }

        public List<TipoTransaccion> ConsultarTipoTransacciones()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarTipoTransacciones";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<TipoTransaccion> _tipoTransacciones = _datatable.DataTableToList<TipoTransaccion>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _tipoTransacciones;
                }
            }
        }

        public List<Producto> ConsultarProductos(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarProductos";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Producto> _productos = _datatable.DataTableToList<Producto>();

                    return _productos;
                }
            }
        }

        public List<TipoPago> ConsultarTipoPagos()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarTipoPagos";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<TipoPago> _listTipoPagos = _datatable.DataTableToList<TipoPago>();

                    return _listTipoPagos;
                }
            }
        }

        public bool RegistrarActualizarEmpleado(List<Empleado> empleado)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "RegistrarActualizarEmpleado";
                    _command.Parameters.AddWithValue("@JsonEmpleado", JsonConvert.SerializeObject(empleado));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool AsignarEmpleadoServicio(List<EmpleadoServicio> empleadoInsumo)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "AsignarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@JsonEmpleadoServicio", JsonConvert.SerializeObject(empleadoInsumo));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool DesasignarEmpleadoServicio(int idEmpleadoServicio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "DesasignarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@IdEmpleadoServicio", idEmpleadoServicio);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool AsignarEmpleadoInsumo(List<Transaccion> empleadoInsumo)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "AsignarEmpleadoInsumo";
                    _command.Parameters.AddWithValue("@JsonEmpleadoInsumo", JsonConvert.SerializeObject(empleadoInsumo));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool EliminarEmpleadoInsumo(Transaccion transaccionInsumo)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "EliminarEmpleadoInsumo";
                    _command.Parameters.AddWithValue("@JsonTransaccion", JsonConvert.SerializeObject(transaccionInsumo));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarProducto(List<Producto> producto)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarProducto";
                    _command.Parameters.AddWithValue("@JsonProducto", JsonConvert.SerializeObject(producto));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Transaccion> ConsultarProductoTransacciones(int idProducto, string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarProductoTransacciones";
                    _command.Parameters.AddWithValue("@IdProducto", idProducto);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Transaccion> _transacciones = _datatable.DataTableToList<Transaccion>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _transacciones;
                }
            }
        }

        public List<Gasto> ConsultarGastos(BusquedaGasto busquedaGasto)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarGastos";
                    _command.Parameters.AddWithValue("@JsonBusqueda", JsonConvert.SerializeObject(busquedaGasto));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Gasto> _gastos = _datatable.DataTableToList<Gasto>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _gastos;
                }
            }
        }

        public CajaMenor ConsultarCajaMenor(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarCajaMenor";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    CajaMenor _cajaMenor = _datatable.DataTableToList<CajaMenor>().FirstOrDefault();

                    return _cajaMenor;
                }
            }
        }

        public bool GuardarCajaMenor(List<CajaMenor> cajaMenor)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarCajaMenor";
                    _command.Parameters.AddWithValue("@JsonCajaMenor", JsonConvert.SerializeObject(cajaMenor));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool ReemplazarCajaMenor(List<CajaMenor> cajaMenor)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ReemplazarCajaMenor";
                    _command.Parameters.AddWithValue("@JsonCajaMenor", JsonConvert.SerializeObject(cajaMenor));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarGasto(List<Gasto> gasto)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarGasto";
                    _command.Parameters.AddWithValue("@JsonGasto", JsonConvert.SerializeObject(gasto));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool EliminarGastos(List<Gasto> gastos)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "EliminarGastos";
                    _command.Parameters.AddWithValue("@JsonGastos", JsonConvert.SerializeObject(gastos));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Usuario> ConsultarUsuarios(string idEmpresa)
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
                    _command.CommandText = "ConsultarUsuarios";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
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

        public bool ConsultarUsuario(string nombre)
        {
            bool existeRegistro;

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUsuario";
                    _command.Parameters.AddWithValue("@Nombre", nombre);

                    SqlDataReader _reader = _command.ExecuteReader();
                    if (_reader.Read())
                        existeRegistro = true;
                    else
                        existeRegistro = false;

                    _command.Dispose();
                    _reader.Close();

                    return existeRegistro;
                }
            }
        }

        public bool GuardarUsuario(Usuario usuario)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarUsuario";
                    _command.Parameters.AddWithValue("@JsonUsuario", JsonConvert.SerializeObject(usuario));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public Usuario ConsultarUserAvatar(int userId, string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUserAvatar";
                    _command.Parameters.AddWithValue("@UserId", userId);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    Usuario _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _usuario;
                }
            }
        }

        public List<EmpresaPropiedad> ConsultarEmpresaPropiedades(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpresaPropiedades";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<EmpresaPropiedad> _empresaPropiedades = _datatable.DataTableToList<EmpresaPropiedad>();

                    return _empresaPropiedades;
                }
            }
        }

        public List<Empleado> ConsultarEmpleadosAutoComplete(string idEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleadosAutoComplete";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empleado> _empleados = _datatable.DataTableToList<Empleado>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleados;
                }
            }
        }

        public bool GuardarActualizarAgenda(Agenda agenda)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarActualizarAgenda";
                    _command.Parameters.AddWithValue("@JsonAgenda", JsonConvert.SerializeObject(agenda));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Agenda> ConsultarAgenda(Agenda agenda)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarAgenda";
                    _command.Parameters.AddWithValue("@JsonAgenda", JsonConvert.SerializeObject(agenda));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Agenda> _agenda = _datatable.DataTableToList<Agenda>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _agenda;
                }
            }
        }

        public List<Agenda> ConsultarAgendaTransacciones(Agenda agenda)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarAgendaTransacciones";
                    _command.Parameters.AddWithValue("@JsonAgenda", JsonConvert.SerializeObject(agenda));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Agenda> _agenda = _datatable.DataTableToList<Agenda>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _agenda;
                }
            }
        }

        public bool CancelarAgenda(int idAgenda, string idEmpresa, string usuarioSistema)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "CancelarAgenda";
                    _command.Parameters.AddWithValue("@IdAgenda", idAgenda);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@UsuarioSistema", usuarioSistema);
                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool ConfirmarAgenda(int idAgenda, string idEmpresa, string usuarioSistema)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConfirmarAgenda";
                    _command.Parameters.AddWithValue("@IdAgenda", idAgenda);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@UsuarioSistema", usuarioSistema);
                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public int ConsultarNumeroCitasDia(string fechaConsulta, string idEmpresa)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarNumeroCitasDia";
                    _command.Parameters.AddWithValue("@FechaConsulta", fechaConsulta);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);

                    int numeroCitas = Convert.ToInt32(_command.ExecuteScalar());

                    _command.Dispose();

                    return numeroCitas;
                }
            }
        }

        public Usuario ValidarUsuarioAdmin(string nombre, string password)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ValidarUsuarioAdmin";
                    _command.Parameters.AddWithValue("@Nombre", nombre);
                    _command.Parameters.AddWithValue("@Password", password);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    Usuario _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _usuario;
                }
            }
        }

        public List<Empresa> ConsultarEmpresas()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpresas";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empresa> _empresas = _datatable.DataTableToList<Empresa>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empresas;
                }
            }
        }

        public List<Empresa> ConsultarUsuarioEmpresas(int idUsuario)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUsuarioEmpresas";
                    _command.Parameters.AddWithValue("@IdUsuario", idUsuario);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empresa> _empresas = _datatable.DataTableToList<Empresa>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empresas;
                }
            }
        }

        public List<SistemaPropiedad> ConsultarSistemaPropiedades()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarSistemaPropiedades";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<SistemaPropiedad> _sistemaPropiedades = _datatable.DataTableToList<SistemaPropiedad>();

                    return _sistemaPropiedades;
                }
            }
        }

        public bool GuardarEmpresaPropiedades(List<EmpresaPropiedad> empresaPropiedades)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarEmpresaPropiedades";
                    _command.Parameters.AddWithValue("@JsonPropiedades", JsonConvert.SerializeObject(empresaPropiedades));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool RegistrarClientes(List<Cliente> clientes)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "RegistrarClientes";
                    _command.Parameters.AddWithValue("@JsonClientes", JsonConvert.SerializeObject(clientes));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool RegistrarFacturacionServicios(AplicacionPago aplicacionPago)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "RegistrarFacturacionServicios";
                    _command.Parameters.AddWithValue("@JsonAplicacionPago", JsonConvert.SerializeObject(aplicacionPago));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<EmpleadoNomina> ConsultarNominaEmpleados(string idEmpresa, string fechaNomina)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarNominaEmpleados";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@FechaNomina", fechaNomina);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<EmpleadoNomina> _nominaEmpleados = _datatable.DataTableToList<EmpleadoNomina>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _nominaEmpleados;
                }
            }
        }

        public List<Agenda> ConsultarNominaEmpleadoServicios(string idEmpresa, int idEmpleado, string fechaNomina)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarNominaEmpleadoServicios";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@IdEmpleado", idEmpleado);
                    _command.Parameters.AddWithValue("@FechaNomina", fechaNomina);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Agenda> _empleadoServicios = _datatable.DataTableToList<Agenda>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleadoServicios;
                }
            }
        }

        public List<Gasto> ConsultarEmpleadoPrestamos(string idEmpresa, int idEmpleado)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleadoPrestamos";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@IdEmpleado", idEmpleado);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Gasto> _empleadoPrestamos = _datatable.DataTableToList<Gasto>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleadoPrestamos;
                }
            }
        }

        public bool LiquidarNominaEmpleados(AplicacionNomina aplicacionNomina)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "LiquidarNominaEmpleados";
                    _command.Parameters.AddWithValue("@JsonAplicacionNomina", JsonConvert.SerializeObject(aplicacionNomina));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool SincronizarDepartamentos(List<DepartmentProperties> departmentProperties)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "SincronizarDepartamentos";
                    _command.Parameters.AddWithValue("@Json", JsonConvert.SerializeObject(departmentProperties));
                    _command.CommandTimeout = 50;

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Agenda> ConsultarServiciosCliente(Agenda agenda)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServiciosCliente";
                    _command.Parameters.AddWithValue("@JsonAgenda", JsonConvert.SerializeObject(agenda));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Agenda> _agenda = _datatable.DataTableToList<Agenda>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _agenda;
                }
            }
        }

        public List<ClientePago> ConsultarPagosCliente(BusquedaPago busquedaPago)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarPagosCliente";
                    _command.Parameters.AddWithValue("@JsonPagos", JsonConvert.SerializeObject(busquedaPago));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<ClientePago> _clientPagos = _datatable.DataTableToList<ClientePago>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _clientPagos;
                }
            }
        }

        public List<Agenda> ConsultarServiciosEmpleado(Agenda agenda)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarServiciosEmpleado";
                    _command.Parameters.AddWithValue("@JsonAgenda", JsonConvert.SerializeObject(agenda));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Agenda> _agenda = _datatable.DataTableToList<Agenda>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _agenda;
                }
            }
        }

        public List<MovimientoCajaMenor> ConsultarMovimientosCajaMenor(string idEmpresa, string fechaDesde, string fechaHasta)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarMovimientosCajaMenor";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _command.Parameters.AddWithValue("@FechaDesde", fechaDesde);
                    _command.Parameters.AddWithValue("@FechaHasta", fechaHasta);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<MovimientoCajaMenor> _movimientosCajaMenor = _datatable.DataTableToList<MovimientoCajaMenor>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _movimientosCajaMenor;
                }
            }
        }

        public List<TipoPromocion> ConsultarTipoPromociones()
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarTipoPromociones";
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<TipoPromocion> _listTipoPromociones = _datatable.DataTableToList<TipoPromocion>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listTipoPromociones;
                }
            }
        }

        public bool GuardarPromocion(Promocion promocion)
        {            
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarPromocion";
                    _command.Parameters.AddWithValue("@JsonPromocion", JsonConvert.SerializeObject(promocion));
                    _command.CommandTimeout = 60;

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Promocion> ConsultarPromociones(string idEmpresa)
        {
            DataSet _dataset = new DataSet();
            List<Promocion> _promociones = new List<Promocion>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarPromociones";
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_dataset);

                    _dataset.Tables[0].TableName = "Promociones";
                    _dataset.Tables[1].TableName = "Detalle_Promocion";

                    _dataset.Relations.Add("DetallePromocion",
                   _dataset.Tables["Promociones"].Columns["Id_Promocion"],
                   _dataset.Tables["Detalle_Promocion"].Columns["Id_Promocion"]);

                    _promociones = _dataset.Tables["Promociones"]
                    .AsEnumerable()
                    .Select(row =>
                    {
                        Promocion promocion = row.ToObject<Promocion>();
                        promocion.Detalles_Promocion = row.GetChildRows("DetallePromocion").DataTableToList<DetallePromocion>();
                        return promocion;
                    })
                    .ToList();

                    return _promociones;
                }
            }
        }

        public bool EliminarServicioPromocion(string idDetallePromocion, string idPromocion)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "EliminarServicioPromocion";
                    _command.Parameters.AddWithValue("@IdDetallePromocion", idDetallePromocion);
                    _command.Parameters.AddWithValue("@IdPromocion", idPromocion);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public Promocion ConsultarPromocion(string idPromocion, string idEmpresa)
        {
            DataSet _dataset = new DataSet();
            Promocion _promocion = new Promocion();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarPromocion";
                    _command.Parameters.AddWithValue("@IdPromocion", idPromocion);
                    _command.Parameters.AddWithValue("@IdEmpresa", idEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_dataset);

                    _dataset.Tables[0].TableName = "Promocion";
                    _dataset.Tables[1].TableName = "Detalle_Promocion";

                    _dataset.Relations.Add("DetallePromocion",
                   _dataset.Tables["Promocion"].Columns["Id_Promocion"],
                   _dataset.Tables["Detalle_Promocion"].Columns["Id_Promocion"]);

                    _promocion = _dataset.Tables["Promocion"]
                    .AsEnumerable()
                    .Select(row =>
                    {
                        Promocion promocion = row.ToObject<Promocion>();
                        promocion.Detalles_Promocion = row.GetChildRows("DetallePromocion").DataTableToList<DetallePromocion>();
                        return promocion;
                    })
                    .FirstOrDefault();

                    return _promocion;
                }
            }
        }

        public bool ActualizarEmpleadoServicio(EmpleadoServicio empleadoServicio)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ActualizarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@JsonEmpleadoServicio", JsonConvert.SerializeObject(empleadoServicio));
                    _command.CommandTimeout = 60;

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool RegistrarSesion(Sesion sesion)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "RegistrarSesion";
                    _command.Parameters.AddWithValue("@JsonSesion", JsonConvert.SerializeObject(sesion));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }
    }
}