using Spa.Domain.SpaEntities;
using System.Collections.Generic;

namespace Admin.Application.AdminService
{
    public interface IAdminService
    {
        List<CategoriaServicio> ConsultarCategoriaServicios();
        List<Menu> ConsultarMenuAdmin();
        List<Empresa> ConsultarSedesPrincipales();
        List<Empresa> ConsultarEmpresasAdmin();
        List<Usuario> ConsultarUsuariosAdmin();
        bool GuardarEmpresa(Empresa empresa);
        bool GuardarServicioAdmin(ServicioMaestro servicio);
        List<ServicioMaestro> ConsultarServiciosAdmin();
    }
}
