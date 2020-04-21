using Spa.Domain.SpaEntities;

namespace Spa.Application.SpaService
{
    public interface ISpaService
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
    }
}
