using Spa.Domain.SpaEntities;

namespace Admin.Infrastructure.AdminRepository
{
    public interface IAdminRepository
    {
        bool GuardarEmpresa(Empresa empresa);
    }
}
