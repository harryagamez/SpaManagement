using Spa.Domain.SpaEntities;
using Spa.InfraCommon.SpaCommon.Models;
using System.Collections.Generic;

namespace Admin.Infrastructure.AdminRepository
{
    public interface IAdminRepository
    {
        List<CategoriaServicio> ConsultarCategoriaServicios();
        List<Empresa> ConsultarSedesPrincipales();
        List<Menu> ConsultarMenuAdmin();
        List<Empresa> ConsultarEmpresasAdmin();
        List<Usuario> ConsultarUsuariosAdmin();
        bool GuardarEmpresa(Empresa empresa);
    }
}
