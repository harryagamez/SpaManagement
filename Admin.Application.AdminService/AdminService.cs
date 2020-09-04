using Spa.Domain.SpaEntities;
using Admin.Infrastructure.AdminRepository;

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

        public bool GuardarEmpresa(Empresa empresa)
        {
            return _adminRepository.GuardarEmpresa(empresa);
        }
    }
}
