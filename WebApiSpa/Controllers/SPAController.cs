using CacheCow.Server.WebApi;
using Spa.Application.SpaService;
using Spa.Domain.SpaEntities;
using Spa.Domain.SpaEntities.Extensions;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;

namespace WebApiSpa.Controllers
{
    [Authorize]
    public class SPAController : ApiController
    {
        private readonly ISpaService _spaService;
        private readonly string _connectionString;

        public SPAController()
        {
            _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["SpaDBConnection"].ConnectionString.ToString();
            _spaService = new SpaService(_connectionString);
        }

        [HttpGet]
        [Route("api/SPA/ValidarUsuario")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion)
        {
            try
            {
                Usuario _usuario = _spaService.ValidarUsuario(Nombre, Password, ValidarIntegracion, CodigoIntegracion);

                if (_usuario != null)
                    return Content(HttpStatusCode.OK, _usuario);
                else
                    return Content(HttpStatusCode.NotFound, _usuario);

            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error validando el usuario: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarClientes")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarClientes(string IdEmpresa)
        {
            try
            {
                List<Cliente> _clientes = _spaService.ConsultarClientes(IdEmpresa);

                return Content(HttpStatusCode.OK, _clientes);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando la lista de clientes: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarCliente")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarCliente(string Cedula, string IdEmpresa)
        {
            try
            {
                Cliente _cliente = _spaService.ConsultarCliente(Cedula, IdEmpresa);

                return Content(HttpStatusCode.OK, _cliente);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando el cliente: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/RegistrarActualizarCliente")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult RegistrarActualizarCliente(List<Cliente> cliente)
        {
            try
            {
                bool result = _spaService.RegistrarActualizarCliente(cliente);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error actualizando el cliente: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarMenu")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarMenu(int IdUsuario, string IdEmpresa, string Perfil)
        {
            try
            {
                List<Menu> _listMenu = _spaService.ConsultarMenu(IdUsuario, IdEmpresa, Perfil);

                return Content(HttpStatusCode.OK, _listMenu);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando el menu: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarMunicipios")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarMunicipios()
        {
            try
            {
                List<Municipio> _listMunicipios = _spaService.ConsultarMunicipios();

                return Content(HttpStatusCode.OK, _listMunicipios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los municipios: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarBarrios")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarBarrios(int IdMunicipio)
        {
            try
            {
                List<Barrio> _listBarrios = _spaService.ConsultarBarrios(IdMunicipio);

                return Content(HttpStatusCode.OK, _listBarrios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los barrios: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarTipoClientes")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarTipoClientes()
        {
            try
            {
                List<TipoCliente> _listTipoClientes = _spaService.ConsultarTipoClientes();

                return Content(HttpStatusCode.OK, _listTipoClientes);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los tipos de clientes: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarTipoServicios")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarTipoServicios()
        {
            try
            {
                List<TipoServicio> _listTipoServicios = _spaService.ConsultarTipoServicios();

                return Content(HttpStatusCode.OK, _listTipoServicios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los tipos de servicio: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarServicios")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarServicios(string IdEmpresa)
        {
            try
            {
                List<Servicio> _servicios = _spaService.ConsultarServicios(IdEmpresa);

                return Content(HttpStatusCode.OK, _servicios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los servicios: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/GuardarServicio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarServicio(List<Servicio> servicio)
        {
            try
            {
                bool result = _spaService.GuardarServicio(servicio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando/actualizando el servicio: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarEmpleados")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarEmpleados(string IdEmpresa)
        {
            try
            {
                List<Empleado> _empleados = _spaService.ConsultarEmpleados(IdEmpresa);

                return Content(HttpStatusCode.OK, _empleados);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando la lista de empleados: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarEmpleado")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarEmpleado(string Cedula, string IdEmpresa)
        {
            try
            {
                Empleado _empleado = _spaService.ConsultarEmpleado(Cedula, IdEmpresa);

                return Content(HttpStatusCode.OK, _empleado);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando el empleado: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/RegistrarActualizarEmpleado")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult RegistrarActualizarEmpleado(List<Empleado> empleado)
        {
            try
            {
                bool result = _spaService.RegistrarActualizarEmpleado(empleado);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error actualizando el empleado: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/AsignarEmpleadoServicio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult AsignarEmpleadoServicio(List<EmpleadoServicio> empleadoservicio)
        {
            try
            {
                bool result = _spaService.AsignarEmpleadoServicio(empleadoservicio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error asignando servicio al empleado: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/DesasignarEmpleadoServicio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult DesasignarEmpleadoServicio(int IdEmpleadoServicio)
        {
            try
            {
                bool result = _spaService.DesasignarEmpleadoServicio(IdEmpleadoServicio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error desasignando el servicio: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/AsignarEmpleadoInsumo")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult AsignarEmpleadoInsumo(List<Transaccion> empleadoinsumo)
        {
            try
            {
                bool result = _spaService.AsignarEmpleadoInsumo(empleadoinsumo);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error asignando insumo al empleado: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/EliminarEmpleadoInsumo")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult EliminarEmpleadoInsumo(int IdTransaccion, int Cantidad, int IdProducto)
        {
            try
            {
                bool result = _spaService.EliminarEmpleadoInsumo(IdTransaccion, Cantidad, IdProducto);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error eliminando el insumo: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarEmpleadoServicio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarEmpleadoServicio(int IdEmpleado)
        {
            try
            {
                List<EmpleadoServicio> _listEmpleadoServicio = _spaService.ConsultarEmpleadoServicio(IdEmpleado);

                return Content(HttpStatusCode.OK, _listEmpleadoServicio);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los servicios del empleado: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarEmpleadoInsumos")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarEmpleadoInsumos(int IdEmpleado)
        {
            try
            {
                List<Transaccion> _listEmpleadoInsumo = _spaService.ConsultarEmpleadoInsumos(IdEmpleado);

                return Content(HttpStatusCode.OK, _listEmpleadoInsumo);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los insumos del empleado: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarTipoTransacciones")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarTipoTransacciones()
        {
            try
            {
                List<TipoTransaccion> _tipoTransacciones = _spaService.ConsultarTipoTransacciones();

                return Content(HttpStatusCode.OK, _tipoTransacciones);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los tipos de transacciones: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarProductos")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarProductos(string IdEmpresa)
        {
            try
            {
                List<Producto> _productos = _spaService.ConsultarProductos(IdEmpresa);

                return Content(HttpStatusCode.OK, _productos);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los productos: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarTipoPagos")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarTipoPagos()
        {
            try
            {
                List<TipoPago> _listTipoPagos = _spaService.ConsultarTipoPagos();

                return Content(HttpStatusCode.OK, _listTipoPagos);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los tipos de pago: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/GuardarProducto")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarProducto(List<Producto> producto)
        {
            try
            {
                bool result = _spaService.GuardarProducto(producto);

                return Content(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando/actualizando el producto: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarProductoTransacciones")]
        [HttpCache(DefaultExpirySeconds =2)]
        public IHttpActionResult ConsultarProductoTransacciones(int IdProducto, string IdEmpresa)
        {
            try
            {
                List<Transaccion> _transacciones = _spaService.ConsultarProductoTransacciones(IdProducto, IdEmpresa);

                return Content(HttpStatusCode.OK, _transacciones);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando las transacciones del producto: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/SPA/ConsultarGastos")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarGastos(BusquedaGasto _BusquedaGasto)
        {
            try
            {
                List<Gasto> _gastos = _spaService.ConsultarGastos(_BusquedaGasto);

                return Content(HttpStatusCode.OK, _gastos);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los gastos: " + ex.Message);
            }
        }

    }
}
