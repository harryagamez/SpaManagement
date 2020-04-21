using Spa.Domain.SpaEntities;

namespace Spa.Infrastructure.SpaRepository
{
    public interface ISpaRepository
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
        bool ActualizarCodigoIntegracion(int IdUsuario, string IdEmpresa, string CodigoIntegracion);
    }
}
