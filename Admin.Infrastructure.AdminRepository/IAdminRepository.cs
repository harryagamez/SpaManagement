using Spa.Domain.SpaEntities;
using Spa.InfraCommon.SpaCommon.Models;
using System.Collections.Generic;

namespace Admin.Infrastructure.AdminRepository
{
    public interface IAdminRepository
    {
        List<CategoriaServicio> ConsultarCategoriaServicios();
        List<Empresa> ConsultarSedesPrincipales();
        bool GuardarEmpresa(Empresa empresa);
    }
}
