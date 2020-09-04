using System.Web.Http;
using Admin.Application.AdminService;
using Spa.Domain.SpaEntities;
using CacheCow.Server.WebApi;
using System.Net;

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
