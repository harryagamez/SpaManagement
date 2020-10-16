using Spa.Domain.SpaEntities;
using Spa.Domain.SpaEntities.Extensions;
using Spa.InfraCommon.SpaCommon.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Spa.Application.SpaService
{
    public interface ISpaService
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
        bool RegistrarActualizarCliente(List<Cliente> cliente);
        List<Menu> ConsultarMenu(int IdUsuario, string IdEmpresa, string Perfil);
        List<Cliente> ConsultarClientes(string IdEmpresa);
        bool SincronizarBarrios(List<Properties> _Properties, string _Municipio);
        List<Municipio> ConsultarMunicipios();
        List<Barrio> ConsultarBarrios(int IdMunicipio);
        List<TipoCliente> ConsultarTipoClientes();
        Cliente ConsultarCliente(string Cedula, string IdEmpresa);
        List<TipoServicio> ConsultarTipoServicios();
        List<ServicioMaestro> ConsultarServiciosMaestro(string CategoriaEmpresa);
        List<Servicio> ConsultarServicios(string IdEmpresa);
        List<Servicio> ConsultarServiciosActivos(string IdEmpresa);
        bool GuardarServicio(List<Servicio> servicio);
        bool EliminarImagenAdjunta(string IdImagenAdjunta);
        List<Empleado> ConsultarEmpleados(string IdEmpresa);
        Empleado ConsultarEmpleado(string Cedula, string IdEmpresa);
        List<TipoPago> ConsultarTipoPagos();
        bool RegistrarActualizarEmpleado(List<Empleado> empleado);
        bool AsignarEmpleadoServicio(List<EmpleadoServicio> empleadoServicio);
        bool DesasignarEmpleadoServicio(int IdEmpleadoServicio);
        bool AsignarEmpleadoInsumo(List<Transaccion> _EmpleadoInsumo);
        bool EliminarEmpleadoInsumo(int IdTransaccion, int Cantidad, int IdProducto);
        List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado, string IdEmpresa);
        List<Transaccion> ConsultarEmpleadoInsumos(int IdEmpleado);
        List<TipoTransaccion> ConsultarTipoTransacciones();
        List<Producto> ConsultarProductos(string IdEmpresa);
        bool GuardarProducto(List<Producto> producto);
        List<Transaccion> ConsultarProductoTransacciones(int IdProducto, string IdEmpresa);
        List<Gasto> ConsultarGastos(BusquedaGasto busquedaGasto);
        CajaMenor ConsultarCajaMenor(string IdEmpresa);
        bool GuardarCajaMenor(List<CajaMenor> cajaMenor);
        bool ReemplazarCajaMenor(List<CajaMenor> cajaMenor);
        bool GuardarGasto(List<Gasto> gasto);
        bool EliminarGastos(List<Gasto> gastos);
        List<Usuario> ConsultarUsuarios(string IdEmpresa);
        bool ConsultarUsuario(string nombre);
        bool GuardarUsuario(Usuario usuario);
        Usuario ConsultarUserAvatar(int UserId, string IdEmpresa);
        List<EmpresaPropiedades> ConsultarEmpresaPropiedades(string IdEmpresa);
        List<Empleado> ConsultarEmpleadosAutoComplete(string IdEmpresa);
        bool GuardarActualizarAgenda(Agenda agenda);
        List<Agenda> ConsultarAgenda(Agenda agenda);
        bool CancelarAgenda(int IdAgenda, string IdEmpresa);
        bool ConfirmarAgenda(int IdAgenda, string IdEmpresa);
        int ConsultarNumeroCitasDia(string fechaConsulta, string idEmpresa);
        Usuario ValidarUsuarioAdmin(string Nombre, string Password);
        List<Empresa> ConsultarEmpresas();
        List<Empresa> ConsultarUsuarioEmpresas(int IdUsuario);
        List<SistemaPropiedades> ConsultarSistemaPropiedades();
        bool GuardarEmpresaPropiedades(List<EmpresaPropiedades> empresaPropiedades);
        Task EmailConfirmacionAgenda(Agenda agenda);
        bool RegistrarClientes(List<Cliente> clientes);
        bool RegistrarFacturacionServicios(AplicacionPago aplicacionPago);
        List<EmpleadoNomina> ConsultarEmpleadosNomina(string idEmpresa, string fechaNomina);
    }
}
