﻿using Spa.Domain.SpaEntities;
using System;
using System.Data;
using System.Data.SqlClient;
using Spa.InfraCommon.SpaCommon.Helpers;
using System.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using Spa.InfraCommon.SpaCommon.Models;
using Spa.Domain.SpaEntities.Extensions;

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
            SqlDataAdapter _adapter = new SqlDataAdapter();

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

                    _adapter.Fill(_datatable);

                    Usuario _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _usuario;
                }
            }
        }

        public bool ActualizarCodigoIntegracion(int IdUsuario, string IdEmpresa, string CodigoIntegracion)
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

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool RegistrarActualizarCliente(List<Cliente> _Cliente)
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

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Menu> ConsultarMenu(int IdUsuario, string IdEmpresa, string Perfil)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

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
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                    _command.Parameters.AddWithValue("@Perfil", Perfil);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Menu> _listMenu = _datatable.DataTableToList<Menu>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listMenu;
                }
            }
        }

        public List<Cliente> ConsultarClientes(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

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

                    _adapter.Fill(_datatable);
                    List<Cliente> _clientes = _datatable.DataTableToList<Cliente>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _clientes;
                }
            }
        }

        public bool SincronizarBarrios(List<Properties> _Properties, string _Municipio)
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
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

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

        public List<Barrio> ConsultarBarrios(int IdMunicipio)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

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
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

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

        public Cliente ConsultarCliente(string Cedula, string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

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
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

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

        public List<Servicio> ConsultarServicios(string IdEmpresa)
        {

            DataSet _dataset = new DataSet();
            List<Servicio> _servicios = new List<Servicio>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

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
                        Servicio servicio = row.ToObject<Servicio>();
                        servicio.Imagenes_Servicio = row.GetChildRows("ServicioImagenes").DataTableToList<ImagenServicio>();
                        return servicio;
                    })
                    .ToList();

                    return _servicios;
                }
            }
        }

        public bool GuardarServicio(List<Servicio> _Servicio)
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

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool EliminarImagenAdjunta(string IdImagenAdjunta)
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
                    _command.CommandText = "EliminarImagenAdjunta";
                    _command.Parameters.AddWithValue("@IdImagenAdjunta", IdImagenAdjunta);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Empleado> ConsultarEmpleados(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

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

                    _adapter.Fill(_datatable);
                    List<Empleado> _empleados = _datatable.DataTableToList<Empleado>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleados;
                }
            }
        }

        public Empleado ConsultarEmpleado(string Cedula, string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleado";
                    _command.Parameters.AddWithValue("@CedulaEmpleado", Cedula);
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    Empleado _empleado = _datatable.DataTableToList<Empleado>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empleado;
                }
            }
        }

        public List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@IdEmpleado", IdEmpleado);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<EmpleadoServicio> _listEmpleadoServicio = _datatable.DataTableToList<EmpleadoServicio>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _listEmpleadoServicio;
                }
            }
        }

        public List<Transaccion> ConsultarEmpleadoInsumos(int IdEmpleado)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpleadoInsumos";
                    _command.Parameters.AddWithValue("@IdEmpleado", IdEmpleado);
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
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

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

        public List<Producto> ConsultarProductos(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarProductos";
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
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
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

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

        public bool RegistrarActualizarEmpleado(List<Empleado> _Empleado)
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
                    _command.CommandText = "RegistrarActualizarEmpleado";
                    _command.Parameters.AddWithValue("@JsonEmpleado", JsonConvert.SerializeObject(_Empleado));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool AsignarEmpleadoServicio(List<EmpleadoServicio> _EmpleadoServicio)
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
                    _command.CommandText = "AsignarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@JsonEmpleadoServicio", JsonConvert.SerializeObject(_EmpleadoServicio));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool DesasignarEmpleadoServicio(int IdEmpleadoServicio)
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
                    _command.CommandText = "DesasignarEmpleadoServicio";
                    _command.Parameters.AddWithValue("@IdEmpleadoServicio", IdEmpleadoServicio);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool AsignarEmpleadoInsumo(List<Transaccion> _EmpleadoInsumo)
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
                    _command.CommandText = "AsignarEmpleadoInsumo";
                    _command.Parameters.AddWithValue("@JsonEmpleadoInsumo", JsonConvert.SerializeObject(_EmpleadoInsumo));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool EliminarEmpleadoInsumo(int IdTransaccion, int Cantidad, int IdProducto)
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
                    _command.CommandText = "EliminarEmpleadoInsumo";
                    _command.Parameters.AddWithValue("@IdTransaccion", IdTransaccion);
                    _command.Parameters.AddWithValue("@Cantidad", Cantidad);
                    _command.Parameters.AddWithValue("@IdProducto", IdProducto);

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarProducto(List<Producto> _Producto)
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
                    _command.CommandText = "GuardarProducto";
                    _command.Parameters.AddWithValue("@JsonProducto", JsonConvert.SerializeObject(_Producto));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Transaccion> ConsultarProductoTransacciones(int IdProducto, string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarProductoTransacciones";
                    _command.Parameters.AddWithValue("@IdProducto", IdProducto);
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Transaccion> _transacciones = _datatable.DataTableToList<Transaccion>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _transacciones;
                }
            }
        }

        public List<Gasto> ConsultarGastos(BusquedaGasto _BusquedaGasto)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarGastos";
                    _command.Parameters.AddWithValue("@JsonBusqueda", JsonConvert.SerializeObject(_BusquedaGasto));
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Gasto> _gastos = _datatable.DataTableToList<Gasto>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _gastos;
                }
            }
        }

        public CajaMenor ConsultarCajaMenor(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarCajaMenor";
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    CajaMenor _cajaMenor = _datatable.DataTableToList<CajaMenor>().FirstOrDefault();

                    return _cajaMenor;
                }
            }
        }

        public bool GuardarCajaMenor(List<CajaMenor> _CajaMenor)
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
                    _command.CommandText = "GuardarCajaMenor";
                    _command.Parameters.AddWithValue("@JsonCajaMenor", JsonConvert.SerializeObject(_CajaMenor));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool ReemplazarCajaMenor(List<CajaMenor> _CajaMenor)
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
                    _command.CommandText = "ReemplazarCajaMenor";
                    _command.Parameters.AddWithValue("@JsonCajaMenor", JsonConvert.SerializeObject(_CajaMenor));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public bool GuardarGasto(List<Gasto> _Gasto)
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
                    _command.CommandText = "GuardarGasto";
                    _command.Parameters.AddWithValue("@JsonGasto", JsonConvert.SerializeObject(_Gasto));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public List<Usuario> ConsultarUsuarios(string IdEmpresa)
        {
            DataSet _dataset = new DataSet();
            List<Usuario> _usuarios = new List<Usuario>();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUsuarios";
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
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

        public bool ConsultarUsuario(string Nombre)
        {
            bool existeRegistro;

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUsuario";
                    _command.Parameters.AddWithValue("@Nombre", Nombre);

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

        public bool GuardarUsuario(Usuario _Usuario)
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
                    _command.CommandText = "GuardarUsuario";
                    _command.Parameters.AddWithValue("@JsonUsuario", JsonConvert.SerializeObject(_Usuario));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public Usuario ConsultarUserAvatar(int UserId, string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUserAvatar";
                    _command.Parameters.AddWithValue("@UserId", UserId);
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    Usuario _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _usuario;
                }
            }
        }

        public EmpresaPropiedades ConsultarEmpresaPropiedades(string IdEmpresa)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarEmpresaPropiedades";
                    _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    EmpresaPropiedades _empresapropiedades = _datatable.DataTableToList<EmpresaPropiedades>().FirstOrDefault();

                    return _empresapropiedades;
                }
            }
        }

        public bool EliminarGastos(List<Gasto> _Gastos)
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
                    _command.CommandText = "EliminarGastos";
                    _command.Parameters.AddWithValue("@JsonGastos", JsonConvert.SerializeObject(_Gastos));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }

        public Usuario ValidarUsuarioAdmin(string Nombre, string Password)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ValidarUsuarioAdmin";
                    _command.Parameters.AddWithValue("@Nombre", Nombre);
                    _command.Parameters.AddWithValue("@Password", Password);
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
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

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

        public List<Empresa> ConsultarUsuarioEmpresas(int IdUsuario)
        {
            DataTable _datatable = new DataTable();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                if (_connection.State == ConnectionState.Closed)
                {
                    _connection.Open();
                }

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "ConsultarUsuarioEmpresas";
                    _command.Parameters.AddWithValue("@IdUsuario", IdUsuario);
                    _adapter.SelectCommand = _command;

                    _adapter.Fill(_datatable);
                    List<Empresa> _empresas = _datatable.DataTableToList<Empresa>();

                    _adapter.Dispose();
                    _command.Dispose();

                    return _empresas;
                }
            }
        }

    }
}
