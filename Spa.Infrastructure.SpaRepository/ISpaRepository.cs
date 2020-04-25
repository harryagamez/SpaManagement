using Spa.Domain.SpaEntities;
using Spa.InfraCommon.SpaCommon.Models;
using System.Collections.Generic;

namespace Spa.Infrastructure.SpaRepository
{
    public interface ISpaRepository
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
        bool ActualizarCodigoIntegracion(int IdUsuario, string IdEmpresa, string CodigoIntegracion);
        bool RegistrarActualizarCliente(List<Cliente> cliente);
        List<Menu> ConsultarMenu(int IdUsuario);
        List<Cliente> ConsultarClientes(string IdEmpresa);
        bool SincronizarBarrios(List<Properties> _Properties);
        List<Municipio> ConsultarMunicipios();
        List<Barrio> ConsultarBarrios();
        List<TipoCliente> ConsultarTipoClientes();
    }
}
