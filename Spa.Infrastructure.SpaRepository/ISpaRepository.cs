using Spa.Domain.SpaEntities;
using Spa.InfraCommon.SpaCommon.Models;
using System.Collections.Generic;

namespace Spa.Infrastructure.SpaRepository
{
    public interface ISpaRepository
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
        bool ActualizarCodigoIntegracion(int IdUsuario, string IdEmpresa, string CodigoIntegracion);
        bool RegistrarActualizarCliente(List<Cliente> _Cliente);
        List<Menu> ConsultarMenu(int IdUsuario);
        List<Cliente> ConsultarClientes(string IdEmpresa);
        bool SincronizarBarrios(List<Properties> _Properties, string _Municipio);
        List<Municipio> ConsultarMunicipios();
        List<Barrio> ConsultarBarrios(int IdMunicipio);
        List<TipoCliente> ConsultarTipoClientes();
        Cliente ConsultarCliente(string Cedula, string IdEmpresa);
        List<TipoServicio> ConsultarTipoServicios();
        List<Servicio> ConsultarServicios(string IdEmpresa);
        bool GuardarServicio(List<Servicio> _Servicio);
        List<Empleado> ConsultarEmpleados(string IdEmpresa);
        List<TipoPago> ConsultarTipoPagos();
        List<TipoTransaccion> ConsultarTipoTransacciones();
        List<Producto> ConsultarProductos(string IdEmpresa);
        bool RegistrarActualizarEmpleado(List<Empleado> _Empleado);
        bool AsignarEmpleadoServicio(List<EmpleadoServicio> _EmpleadoServicio);
        List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado);
        bool GuardarProducto(List<Producto> _Producto);
        List<Transaccion> ConsultarProductoTransacciones(int IdProducto, string IdEmpresa);
    }
}
