﻿using Spa.Domain.SpaEntities;
using Admin.Infrastructure.AdminRepository;
using System.Collections.Generic;

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

        public List<Departamento> ConsultarDepartamentos()
        {
            return _adminRepository.ConsultarDepartamentos();
        }

        public bool GuardarCategoriaServicio(CategoriaServicio categoria)
        {
            return _adminRepository.GuardarCategoriaServicio(categoria);
        }

        public bool GuardarTipoServicio(TipoServicio tiposervicio)
        {
            return _adminRepository.GuardarTipoServicio(tiposervicio);
        }

        public bool GuardarMunicipio(Municipio municipio)
        {
            return _adminRepository.GuardarMunicipio(municipio);
        }

        public bool GuardarBarrio(Barrio barrio)
        {
            return _adminRepository.GuardarBarrio(barrio);
        }
    }
}
