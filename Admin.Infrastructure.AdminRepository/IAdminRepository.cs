using Spa.Domain.SpaEntities;
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

        List<ServicioMaestro> ConsultarServiciosAdmin();

        bool GuardarEmpresa(Empresa empresa);

        bool GuardarServicioAdmin(ServicioMaestro servicio);

        List<Barrio> ConsultarBarriosAdmin();

        List<Departamento> ConsultarDepartamentos();

        bool GuardarCategoriaServicio(CategoriaServicio categoria);

        bool GuardarTipoServicio(TipoServicio tiposervicio);

        bool GuardarMunicipio(Municipio municipio);

        bool GuardarBarrio(Barrio barrio);
    }
}