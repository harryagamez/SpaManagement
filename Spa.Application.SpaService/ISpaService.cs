﻿using Spa.Domain.SpaEntities;
using Spa.InfraCommon.SpaCommon.Models;
using System.Collections.Generic;

namespace Spa.Application.SpaService
{
    public interface ISpaService
    {
        Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion);
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
        Empleado ConsultarEmpleado(string Cedula, string IdEmpresa);
        List<TipoPago> ConsultarTipoPagos();
        bool RegistrarActualizarEmpleado(List<Empleado> _Empleado);
        bool AsignarEmpleadoServicio(List<EmpleadoServicio> _EmpleadoServicio);
        bool DesasignarEmpleadoServicio(int IdEmpleadoServicio);
        bool AsignarEmpleadoInsumo(List<Transaccion> _EmpleadoInsumo);
        List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado);
        List<Transaccion> ConsultarEmpleadoInsumos(int IdEmpleado);
        List<TipoTransaccion> ConsultarTipoTransacciones();
        List<Producto> ConsultarProductos(string IdEmpresa);
        bool GuardarProducto(List<Producto> _Producto);
        List<Transaccion> ConsultarProductoTransacciones(int IdProducto, string IdEmpresa);
    }
}
