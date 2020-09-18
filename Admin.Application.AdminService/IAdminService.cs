using Spa.Domain.SpaEntities;
using System.Collections.Generic;

namespace Admin.Application.AdminService
{
    public interface IAdminService
    {
        List<CategoriaServicio> ConsultarCategoriaServicios();
        List<Empresa> ConsultarSedesPrincipales();
        List<Empresa> ConsultarTodasLasEmpresas();
        bool GuardarEmpresa(Empresa empresa);
    }
}
