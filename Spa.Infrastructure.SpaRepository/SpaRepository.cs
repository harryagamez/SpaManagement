using Spa.Domain.SpaEntities;
using System;
using System.Data;
using System.Data.SqlClient;
using Spa.InfraCommon.SpaCommon.Helpers;
using System.Linq;

namespace Spa.Infrastructure.SpaRepository
{
    public class SpaRepository : ISpaRepository
    {
        protected readonly string _connectionString;

        public SpaRepository(string ConnectionString)
        {
            _connectionString = ConnectionString;
        }

        public Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion)
        {
            DataTable _datatable = new DataTable();
            Usuario _usuario = new Usuario();
            SqlDataAdapter _adapter = new SqlDataAdapter();

            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {

                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "ValidarUsuario";
                        _command.Parameters.AddWithValue("@Nombre", Nombre);
                        _command.Parameters.AddWithValue("@Password", Password);
                        _command.Parameters.AddWithValue("@ValidarIntegracion", ValidarIntegracion);
                        _command.Parameters.AddWithValue("@CodigoIntegracion", CodigoIntegracion);
                        _adapter.SelectCommand = _command;

                        try
                        {
                            _adapter.Fill(_datatable);
                            _usuario = _datatable.DataTableToList<Usuario>().FirstOrDefault();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return _usuario;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }

        public bool ActualizarCodigoIntegracion(int IdUsuario, string IdEmpresa, string CodigoIntegracion)
        {
            try
            {
                using (SqlConnection _connection = new SqlConnection(_connectionString))
                {

                    if (_connection.State == ConnectionState.Closed)
                    {
                        _connection.Open();
                    }

                    using (SqlCommand _command = _connection.CreateCommand())
                    {
                        _command.CommandType = CommandType.StoredProcedure;
                        _command.CommandText = "ActualizarCodigoIntegracion";
                        _command.Parameters.AddWithValue("@IdUsuario", IdUsuario);
                        _command.Parameters.AddWithValue("@IdEmpresa", IdEmpresa);
                        _command.Parameters.AddWithValue("@CodigoIntegracion", CodigoIntegracion);

                        try
                        {
                            _command.ExecuteNonQuery();
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
