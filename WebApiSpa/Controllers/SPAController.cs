﻿using CacheCow.Server.WebApi;
using Spa.Application.SpaService;
using Spa.Domain.SpaEntities;
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
        public IHttpActionResult ConsultarMenu(int IdUsuario)
        {
            try
            {
                List<Menu> _listMenu = _spaService.ConsultarMenu(IdUsuario);

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
                return Content(HttpStatusCode.InternalServerError, "Error registrando el servicio: " + ex.Message);
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
    }
}
