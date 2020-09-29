using System.Web.Http;
using Admin.Application.AdminService;
using Spa.Domain.SpaEntities;
using System.Collections.Generic;
using CacheCow.Server.WebApi;
using System.Net;
using System;

namespace WebApiSpa.Controllers
{
    [Authorize]
    public class AdminController : ApiController
    {
        private readonly IAdminService _adminService;
        private readonly string _connectionString;

        public AdminController()
        {
            _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["SpaDBConnection"].ConnectionString.ToString();
            _adminService = new AdminService(_connectionString);
        }

        [HttpGet]
        [Route("api/Admin/ConsultarCategoriaServicios")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarCategoriaServicios()
        {
            try
            {
                List<CategoriaServicio> _listCategoriaServicios = _adminService.ConsultarCategoriaServicios();

                return Content(HttpStatusCode.OK, _listCategoriaServicios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando las categorías de los servicios: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Admin/ConsultarMenuAdmin")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarMenuAdmin()
        {
            try
            {
                List<Menu> _listMenu = _adminService.ConsultarMenuAdmin();

                return Content(HttpStatusCode.OK, _listMenu);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando el Menu: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Admin/ConsultarSedesPrincipales")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarSedesPrincipales()
        {
            try
            {
                List<Empresa> _listSedesPrincipales = _adminService.ConsultarSedesPrincipales();

                return Content(HttpStatusCode.OK, _listSedesPrincipales);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando las sedes principales: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Admin/ConsultarEmpresasAdmin")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarEmpresasAdmin()
        {
            try
            {
                List<Empresa> _listEmpresas = _adminService.ConsultarEmpresasAdmin();

                return Content(HttpStatusCode.OK, _listEmpresas);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando las sedes principales: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Admin/ConsultarUsuariosAdmin")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarUsuariosAdmin()
        {
            try
            {
                List<Usuario> _listUsuarios = _adminService.ConsultarUsuariosAdmin();

                return Content(HttpStatusCode.OK, _listUsuarios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los usuarios: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Admin/GuardarEmpresa")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarEmpresa(Empresa empresa)
        {
            try
            {
                bool result = _adminService.GuardarEmpresa(empresa);

                return Content(HttpStatusCode.OK, result);
            }
            catch (System.Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando la empresa: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Admin/GuardarServicioAdmin")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarServicioAdmin(ServicioMaestro servicio)
        {
            try
            {
                bool result = _adminService.GuardarServicioAdmin(servicio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (System.Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando el servicio: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Admin/ConsultarServiciosAdmin")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarServiciosAdmin()
        {
            try
            {
                List<ServicioMaestro> _listServicios = _adminService.ConsultarServiciosAdmin();

                return Content(HttpStatusCode.OK, _listServicios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los servicios: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Admin/ConsultarBarriosAdmin")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarBarriosAdmin()
        {
            try
            {
                List<Barrio> _listBarrios = _adminService.ConsultarBarriosAdmin();

                return Content(HttpStatusCode.OK, _listBarrios);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando los barrios: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Admin/GuardarCategoriaServicio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarCategoriaServicio(CategoriaServicio categoria)
        {
            try
            {
                bool result = _adminService.GuardarCategoriaServicio(categoria);

                return Content(HttpStatusCode.OK, result);
            }
            catch (System.Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando el servicio: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Admin/GuardarTipoServicio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarTipoServicio(TipoServicio tiposervicio)
        {
            try
            {
                bool result = _adminService.GuardarTipoServicio(tiposervicio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (System.Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando el tipo de servicio: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Admin/GuardarMunicipio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarMunicipio(Municipio municipio)
        {
            try
            {
                bool result = _adminService.GuardarMunicipio(municipio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (System.Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando el municipio: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Admin/GuardarBarrio")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult GuardarBarrio(Barrio barrio)
        {
            try
            {
                bool result = _adminService.GuardarBarrio(barrio);

                return Content(HttpStatusCode.OK, result);
            }
            catch (System.Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error registrando el barrio: " + ex.Message);
            }
        }
    }
}
