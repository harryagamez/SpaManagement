using Spa.Domain.SpaEntities;
using Admin.Infrastructure.AdminRepository;
using System.Collections.Generic;
using System;
using Spa.InfraCommon.SpaCommon.Helpers;
using Spa.InfraCommon.SpaCommon.Models;
using System.Globalization;
using System.Threading.Tasks;

namespace Admin.Application.AdminService
{
    public class AdminService : IAdminService
    {
        protected IAdminRepository _adminRepository;
        protected readonly string _connectionString;

        public AdminService(string ConnectionString)
        {
            this._connectionString = ConnectionString;
            _adminRepository = new AdminRepository(_connectionString);
        }

        public List<CategoriaServicio> ConsultarCategoriaServicios()
        {
            return _adminRepository.ConsultarCategoriaServicios();
        }

        public List<Menu> ConsultarMenuAdmin()
        {
            return _adminRepository.ConsultarMenuAdmin();
        }

        public List<Empresa> ConsultarSedesPrincipales()
        {
            return _adminRepository.ConsultarSedesPrincipales();
        }

        public List<Empresa> ConsultarEmpresasAdmin()
        {
            return _adminRepository.ConsultarEmpresasAdmin();
        }

        public List<Usuario> ConsultarUsuariosAdmin()
        {
            return _adminRepository.ConsultarUsuariosAdmin();
        }

        public bool GuardarEmpresa(Empresa empresa)
        {
            return _adminRepository.GuardarEmpresa(empresa);
        }

        public List<ServicioMaestro> ConsultarServiciosAdmin()
        {
            return _adminRepository.ConsultarServiciosAdmin();
        }

        public bool GuardarServicioAdmin(ServicioMaestro servicio)
        {
            return _adminRepository.GuardarServicioAdmin(servicio);
        }

        public List<Barrio> ConsultarBarriosAdmin()
        {
            return _adminRepository.ConsultarBarriosAdmin();
        }
    }
}
