using Spa.Application.SpaService;
using Spa.Domain.SpaEntities;
using System;
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
    }
}
