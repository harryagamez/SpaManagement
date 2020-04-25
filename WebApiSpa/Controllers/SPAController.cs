using CacheCow.Server.WebApi;
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
        public IHttpActionResult ConsultarBarrios()
        {
            try
            {
                List<Barrio> _listBarrios = _spaService.ConsultarBarrios();

                return Content(HttpStatusCode.OK, _listBarrios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los barrios: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/SPA/ConsultarTipoClientes")]
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
    }
}
