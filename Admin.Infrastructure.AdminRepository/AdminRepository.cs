using Spa.Domain.SpaEntities;
using System.Data;
using System.Data.SqlClient;
using Newtonsoft.Json;

namespace Admin.Infrastructure.AdminRepository
{
    public class AdminRepository : IAdminRepository
    {
        protected readonly string _connectionString;

        public AdminRepository(string ConnectionString)
        {
            _connectionString = ConnectionString;
        }

        public bool GuardarEmpresa(Empresa empresa)
        {
            using (SqlConnection _connection = new SqlConnection(_connectionString))
            {
                _connection.Open();

                using (SqlCommand _command = _connection.CreateCommand())
                {
                    _command.CommandType = CommandType.StoredProcedure;
                    _command.CommandText = "GuardarEmpresa";
                    _command.Parameters.AddWithValue("@JsonEmpresa", JsonConvert.SerializeObject(empresa));

                    _command.ExecuteNonQuery();

                    _command.Dispose();

                    return true;
                }
            }
        }
    }
}
