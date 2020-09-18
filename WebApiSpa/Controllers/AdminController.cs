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
        [Route("api/Admin/ConsultarTodasLasEmpresas")]
        [HttpCache(DefaultExpirySeconds = 2)]
        public IHttpActionResult ConsultarTodasLasEmpreas()
        {
            try
            {
                List<Empresa> _listEmpresas = _adminService.ConsultarTodasLasEmpresas();

                return Content(HttpStatusCode.OK, _listEmpresas);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, "Error consultando las sedes principales: " + ex.Message);
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
    }
}
