﻿using Spa.Domain.SpaEntities;
using Spa.Domain.SpaEntities.Extensions;
using Spa.InfraCommon.SpaCommon.Models;
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

        List<EmpresaServicio> ConsultarServicios(string IdEmpresa);

        List<EmpresaServicio> ConsultarServiciosActivos(string IdEmpresa);

        bool GuardarServicio(List<EmpresaServicio> servicio);

        bool EliminarImagenAdjunta(string IdImagenAdjunta);

        List<Empleado> ConsultarEmpleados(string IdEmpresa);

        Empleado ConsultarEmpleado(string Cedula, string IdEmpresa);

        List<TipoPago> ConsultarTipoPagos();

        bool RegistrarActualizarEmpleado(List<Empleado> empleado);

        bool AsignarEmpleadoServicio(List<EmpleadoServicio> empleadoServicio);

        bool DesasignarEmpleadoServicio(int IdEmpleadoServicio);

        bool AsignarEmpleadoInsumo(List<Transaccion> _EmpleadoInsumo);

        bool EliminarEmpleadoInsumo(Transaccion transaccionInsumo);

        List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado, string IdEmpresa);

        List<Transaccion> ConsultarEmpleadoInsumos(int IdEmpleado, string IdEmpresa);

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

        List<EmpresaPropiedad> ConsultarEmpresaPropiedades(string IdEmpresa);

        List<Empleado> ConsultarEmpleadosAutoComplete(string IdEmpresa);

        bool GuardarActualizarAgenda(Agenda agenda);

        List<Agenda> ConsultarAgenda(Agenda agenda);

        List<Agenda> ConsultarAgendaTransacciones(Agenda agenda);

        bool CancelarAgenda(int IdAgenda, string IdEmpresa, string UsuarioSistema);

        bool ConfirmarAgenda(int IdAgenda, string IdEmpresa, string UsuarioSistema);

        int ConsultarNumeroCitasDia(string fechaConsulta, string idEmpresa);

        Usuario ValidarUsuarioAdmin(string Nombre, string Password);

        List<Empresa> ConsultarEmpresas();

        List<Empresa> ConsultarUsuarioEmpresas(int IdUsuario);

        List<SistemaPropiedad> ConsultarSistemaPropiedades();

        bool GuardarEmpresaPropiedades(List<EmpresaPropiedad> empresaPropiedades);

        Task EmailConfirmacionAgenda(Agenda agenda);

        bool RegistrarClientes(List<Cliente> clientes);

        bool RegistrarFacturacionServicios(AplicacionPago aplicacionPago);

        List<EmpleadoNomina> ConsultarNominaEmpleados(string idEmpresa, string fechaNomina);

        List<Agenda> ConsultarNominaEmpleadoServicios(string idEmpresa, int idEmpleado, string fechaNomina);

        List<Gasto> ConsultarEmpleadoPrestamos(string idEmpresa, int idEmpleado);

        bool LiquidarNominaEmpleados(AplicacionNomina aplicacionNomina);

        List<Agenda> ConsultarServiciosCliente(Agenda agenda);

        List<ClientePago> ConsultarPagosCliente(BusquedaPago busquedaPago);

        List<Agenda> ConsultarServiciosEmpleado(Agenda agenda);

        bool SincronizarDepartamentos(List<DepartmentProperties> _departmentProperties);

        List<MovimientoCajaMenor> ConsultarMovimientosCajaMenor(string idEmpresa, string fechaDesde, string fechaHasta);

        List<TipoPromocion> ConsultarTipoPromociones();

        bool GuardarPromocion(Promocion promocion);

        List<Promocion> ConsultarPromociones(string IdEmpresa);

        bool EliminarServicioPromocion(string IdDetallePromocion, string IdPromocion);

        Promocion ConsultarPromocion(string IdPromocion, string IdEmpresa);

        bool ActualizarEmpleadoServicio(EmpleadoServicio empleadoServicio);

        bool RegistrarSesion(Sesion sesion);
    }
}