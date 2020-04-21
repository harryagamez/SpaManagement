using Newtonsoft.Json.Serialization;
using System.Web.Http;

namespace WebApiSpa
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
             name: "ValidarUsuario",
             routeTemplate: "api/{controller}/{Nombre}/{PassWord}/{ValidarIntegracion}/{CodigoIntegracion}",
             defaults: new { Nombre = RouteParameter.Optional, Password = RouteParameter.Optional }
         );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            //Now set the serializer setting for JsonFormatter to Indented to get Json Formatted data  
            config.Formatters.JsonFormatter.SerializerSettings.Formatting =
                Newtonsoft.Json.Formatting.Indented;

            //For converting data in Camel Case  
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver =
                new CamelCasePropertyNamesContractResolver();
        }
    }
}
