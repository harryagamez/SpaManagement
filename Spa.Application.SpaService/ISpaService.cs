using Spa.Domain.SpaEntities;
using Spa.InfraCommon.SpaCommon.Models;
using System.Collections.Generic;

namespace Spa.Application.SpaService
{
    public interface ISpaService
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
        bool RegistrarActualizarCliente(Cliente cliente);
        List<Menu> ConsultarMenu(int IdUsuario);
        List<Cliente> ConsultarClientes(string IdEmpresa);
        bool SincronizarBarrios(List<Properties> _Properties);
    }
}
