using Newtonsoft.Json.Serialization;
using System.Web.Http;

namespace WebApiSpa
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
             name: "ValidarUsuario",
             routeTemplate: "api/{controller}/{Nombre}/{PassWord}/{ValidarIntegracion}/{CodigoIntegracion}",
             defaults: new { Nombre = RouteParameter.Optional, Password = RouteParameter.Optional }
         );

            config.Routes.MapHttpRoute(
             name: "ConsultarMenu",
             routeTemplate: "api/{controller}/{IdUsuario}",
             defaults: new { Nombre = RouteParameter.Optional, Password = RouteParameter.Optional }
         );

            config.Routes.MapHttpRoute(
                    name: "ConsultarClientes",
                    routeTemplate: "api/{controller}/{IdEmpresa}",
                    defaults: new { Nombre = RouteParameter.Optional, Password = RouteParameter.Optional }
         );

            config.Routes.MapHttpRoute(
                    name: "RegistrarActualizarCliente",
                    routeTemplate: "api/{controller}/{cliente}",
                    defaults: new { Nombre = RouteParameter.Optional, Password = RouteParameter.Optional }
         );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
        );

            config.Formatters.JsonFormatter.SerializerSettings.Formatting =
                Newtonsoft.Json.Formatting.Indented;

            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver =
                new CamelCasePropertyNamesContractResolver();
        }
    }
}
