using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Spa.Application.SpaService;
using Spa.Domain.SpaEntities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebApiSpa.Providers
{
    public class AuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        private readonly ISpaService _spaService;
        private readonly string _connectionString;

        public AuthorizationServerProvider()
        {
            _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["SpaDBConnection"].ConnectionString.ToString();
            _spaService = new SpaService(_connectionString);
        }

        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            context.Validated();
            await Task.Delay(1000);
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {

#pragma warning disable IDE0059 // Unnecessary assignment of a value
            Usuario usuario = new Usuario();
#pragma warning restore IDE0059 // Unnecessary assignment of a value

            IFormCollection parameters = await context.Request.ReadFormAsync();

            bool Validatedintegration = Convert.ToBoolean(parameters.Get("validatedintegration"));
            string Integrationcode = parameters.Get("integrationcode");

            if (!string.IsNullOrEmpty(Integrationcode))
                Validatedintegration = true;

            usuario = _spaService.ValidarUsuario(context.UserName, context.Password, Validatedintegration, Integrationcode);
            if (usuario == null)
            {
                usuario = _spaService.ValidarUsuarioAdmin(context.UserName, context.Password);
                if (usuario == null)
                {
                    context.SetError("invalid_grant", "El nombre de usuario y/o contraseña son incorrectos, contacte con el administrador");
                    return;
                }
            }

            ClaimsIdentity identity = new ClaimsIdentity(context.Options.AuthenticationType);
            identity.AddClaim(new Claim("sub", context.UserName));
            identity.AddClaim(new Claim("userName", context.UserName));

            if (usuario.Nombre_Empresa.Contains("[MULTIPLE]") && usuario.Id_Empresa.ToString().Contains("00000000-0000-0000-0000-000000000000"))
                identity.AddClaim(new Claim(ClaimTypes.Role, "Admin"));
            else
                identity.AddClaim(new Claim(ClaimTypes.Role, "User"));

            AuthenticationProperties props = new AuthenticationProperties(new Dictionary<string, string>
                {
                    { "UserName", usuario.Nombre },
                    { "UserId", usuario.Id_Usuario.ToString() },
                    { "IntegrationCode", string.IsNullOrEmpty(usuario.Codigo_Integracion) ? "undefined" : usuario.Codigo_Integracion },
                    { "Validated", (usuario.Nombre_Empresa.Contains("[MULTIPLE]") && usuario.Id_Empresa.ToString().Contains("00000000-0000-0000-0000-000000000000")) ? "True" : usuario.Verificado.ToString() },
                    { "CompanyId", usuario.Id_Empresa.ToString() },
                    { "CompanyName", usuario.Nombre_Empresa.Trim() },
                    { "Role", usuario.Perfil },
                    { "CompanyCategory", usuario.Id_Categoria_Servicio.ToString()}
                });

            AuthenticationTicket ticket = new AuthenticationTicket(identity, props);
            context.Validated(ticket);

            await Task.Delay(500);

        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }
            return Task.FromResult<object>(null);
        }
    }
}