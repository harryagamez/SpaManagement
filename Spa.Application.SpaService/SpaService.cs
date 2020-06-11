using Spa.Domain.SpaEntities;
using Spa.Infrastructure.SpaRepository;
using System;
using Spa.InfraCommon.SpaCommon.Models;
using Spa.InfraCommon.SpaCommon.Helpers;
using System.Collections.Generic;
using Spa.Domain.SpaEntities.Extensions;

namespace Spa.Application.SpaService
{
    public class SpaService : ISpaService
    {

        protected ISpaRepository _spaRepository;
        protected readonly string _connectionString;

        public SpaService(string ConnectionString)
        {
            this._connectionString = ConnectionString;
            _spaRepository = new SpaRepository(_connectionString);
        }

        public Usuario ValidarUsuario(string Nombre, string Password, bool ValidarIntegracion, string CodigoIntegracion)
        {
            try
            {
                Usuario _usuario = _spaRepository.ValidarUsuario(Nombre, Password, ValidarIntegracion, CodigoIntegracion);

                if (_usuario != null)
                {
                    if (_usuario.Codigo_Integracion == null)
                    {
                        EmailModel _emailModel = new EmailModel
                        {
                            MailTo = _usuario.Mail,
                            Subject = "Activación cuenta de usuario - SpaManagement",
                            Body = "Su código de validación para iniciar sesión es: " + _usuario.HashKey
                        };

                        if (MailHelper.SendMail(_emailModel))
                        {
                            _spaRepository.ActualizarCodigoIntegracion(_usuario.Id_Usuario, _usuario.Id_Empresa.ToString(), _usuario.HashKey);
                        }
                    }
                }

                return _usuario;
            }
            catch
            {
                throw;
            }
        }

        public bool RegistrarActualizarCliente(List<Cliente> _Cliente)
        {
            try
            {
                return _spaRepository.RegistrarActualizarCliente(_Cliente);
            }
            catch
            {
                throw;
            }
        }

        public List<Menu> ConsultarMenu(int IdUsuario, string IdEmpresa, string Perfil)
        {
            try
            {
                List<Menu> _listMenu = _spaRepository.ConsultarMenu(IdUsuario, IdEmpresa, Perfil);

                return _listMenu;
            }
            catch
            {
                throw;
            }
        }

        public List<Cliente> ConsultarClientes(string IdEmpresa)
        {
            try
            {
                List<Cliente> _clientes = _spaRepository.ConsultarClientes(IdEmpresa);

                return _clientes;
            }
            catch
            {
                throw;
            }
        }

        public bool SincronizarBarrios(List<Properties> _Properties, string _Municipio)
        {
            try
            {
                bool _result = _spaRepository.SincronizarBarrios(_Properties, _Municipio);

                return _result;
            }
            catch
            {
                throw;
            }
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }

        public List<Municipio> ConsultarMunicipios()
        {
            try
            {
                List<Municipio> _municipios = _spaRepository.ConsultarMunicipios();

                return _municipios;
            }
            catch
            {
                throw;
            }
        }

        public List<Barrio> ConsultarBarrios(int IdMunicipio)
        {
            try
            {
                List<Barrio> _barrios = _spaRepository.ConsultarBarrios(IdMunicipio);

                return _barrios;
            }
            catch
            {
                throw;
            }
        }

        public List<TipoCliente> ConsultarTipoClientes()
        {
            try
            {
                List<TipoCliente> _tipoClientes = _spaRepository.ConsultarTipoClientes();

                return _tipoClientes;
            }
            catch
            {
                throw;
            }
        }

        public Cliente ConsultarCliente(string Cedula, string IdEmpresa)
        {
            try
            {
                Cliente _cliente = _spaRepository.ConsultarCliente(Cedula, IdEmpresa);

                return _cliente;
            }
            catch
            {
                throw;
            }
        }

        public List<TipoServicio> ConsultarTipoServicios()
        {
            try
            {
                List<TipoServicio> _tipoServicios = _spaRepository.ConsultarTipoServicios();

                return _tipoServicios;
            }
            catch
            {
                throw;
            }
        }

        public List<Servicio> ConsultarServicios(string IdEmpresa)
        {
            try
            {
                List<Servicio> _servicios = _spaRepository.ConsultarServicios(IdEmpresa);

                return _servicios;
            }
            catch
            {
                throw;
            }
        }

        public bool GuardarServicio(List<Servicio> _Servicio)
        {
            try
            {
                return _spaRepository.GuardarServicio(_Servicio);
            }
            catch
            {
                throw;
            }
        }

        public bool EliminarImagenAdjunta(string IdImagenAdjunta)
        {
            try
            {
                return _spaRepository.EliminarImagenAdjunta(IdImagenAdjunta);
            }
            catch
            {
                throw;
            }
        }

        public List<Empleado> ConsultarEmpleados(string IdEmpresa)
        {
            try
            {
                List<Empleado> _empleados = _spaRepository.ConsultarEmpleados(IdEmpresa);

                return _empleados;
            }
            catch
            {
                throw;
            }
        }

        public Empleado ConsultarEmpleado(string Cedula, string IdEmpresa)
        {
            try
            {
                Empleado _empleado = _spaRepository.ConsultarEmpleado(Cedula, IdEmpresa);

                return _empleado;
            }
            catch
            {
                throw;
            }
        }

        public List<TipoTransaccion> ConsultarTipoTransacciones()
        {
            try
            {
                List<TipoTransaccion> _tipoTransacciones = _spaRepository.ConsultarTipoTransacciones();

                return _tipoTransacciones;
            }
            catch
            {
                throw;
            }
        }

        public List<Producto> ConsultarProductos(string IdEmpresa)
        {
            try
            {
                List<Producto> _productos = _spaRepository.ConsultarProductos(IdEmpresa);

                return _productos;
            }
            catch
            {
                throw;
            }
        }

        public List<TipoPago> ConsultarTipoPagos()
        {
            try
            {
                List<TipoPago> _tipopagos = _spaRepository.ConsultarTipoPagos();

                return _tipopagos;
            }
            catch
            {
                throw;
            }
        }

        public bool RegistrarActualizarEmpleado(List<Empleado> _Empleado)
        {
            try
            {
                return _spaRepository.RegistrarActualizarEmpleado(_Empleado);
            }
            catch
            {
                throw;
            }
        }

        public bool AsignarEmpleadoServicio(List<EmpleadoServicio> _EmpleadoServicio)
        {
            try
            {
                return _spaRepository.AsignarEmpleadoServicio(_EmpleadoServicio);
            }
            catch
            {
                throw;
            }
        }

        public bool DesasignarEmpleadoServicio(int IdEmpleadoServicio)
        {
            try
            {
                return _spaRepository.DesasignarEmpleadoServicio(IdEmpleadoServicio);
            }
            catch
            {
                throw;
            }
        }

        public bool EliminarEmpleadoInsumo(int IdTransaccion, int Cantidad, int IdProducto)
        {
            try
            {
                return _spaRepository.EliminarEmpleadoInsumo(IdTransaccion, Cantidad, IdProducto);
            }
            catch
            {
                throw;
            }
        }

        public bool AsignarEmpleadoInsumo(List<Transaccion> _EmpleadoInsumo)
        {
            try
            {
                return _spaRepository.AsignarEmpleadoInsumo(_EmpleadoInsumo);
            }
            catch
            {
                throw;
            }
        }

        public List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado)
        {
            try
            {
                List<EmpleadoServicio> _empleadoservicio = _spaRepository.ConsultarEmpleadoServicio(IdEmpleado);

                return _empleadoservicio;
            }
            catch
            {
                throw;
            }
        }

        public List<Transaccion> ConsultarEmpleadoInsumos(int IdEmpleado)
        {
            try
            {
                List<Transaccion> _empleadoinsumo = _spaRepository.ConsultarEmpleadoInsumos(IdEmpleado);

                return _empleadoinsumo;
            }
            catch
            {
                throw;
            }
        }

        public bool GuardarProducto(List<Producto> _Producto)
        {
            try
            {
                return _spaRepository.GuardarProducto(_Producto);
            }
            catch
            {
                throw;
            }
        }

        public List<Transaccion> ConsultarProductoTransacciones(int IdProducto, string IdEmpresa)
        {
            try
            {
                List<Transaccion> _transacciones = _spaRepository.ConsultarProductoTransacciones(IdProducto, IdEmpresa);

                return _transacciones;
            }
            catch
            {
                throw;
            }
        }

        public List<Gasto> ConsultarGastos(BusquedaGasto _BusquedaGasto)
        {
            try
            {
                List<Gasto> _gastos = _spaRepository.ConsultarGastos(_BusquedaGasto);

                return _gastos;
            }
            catch
            {
                throw;
            }
        }

        public CajaMenor ConsultarCajaMenor(string IdEmpresa)
        {
            try
            {
                CajaMenor _cajamenor = _spaRepository.ConsultarCajaMenor(IdEmpresa);

                return _cajamenor;
            }
            catch
            {
                throw;
            }
        }

        public bool GuardarCajaMenor(List<CajaMenor> _CajaMenor)
        {
            try
            {
                return _spaRepository.GuardarCajaMenor(_CajaMenor);
            }
            catch
            {
                throw;
            }
        }

        public bool ReemplazarCajaMenor(List<CajaMenor> _CajaMenor)
        {
            try
            {
                return _spaRepository.ReemplazarCajaMenor(_CajaMenor);
            }
            catch
            {
                throw;
            }
        }

        public bool GuardarGasto(List<Gasto> _Gasto)
        {
            try
            {
                return _spaRepository.GuardarGasto(_Gasto);
            }
            catch
            {
                throw;
            }
        }

        public bool EliminarGastos(List<Gasto> _Gastos)
        {
            try
            {
                return _spaRepository.EliminarGastos(_Gastos);
            }
            catch
            {
                throw;
            }
        }

        public List<Usuario> ConsultarUsuarios(string IdEmpresa)
        {
            try
            {
                List<Usuario> _usuarios = _spaRepository.ConsultarUsuarios(IdEmpresa);

                return _usuarios;
            }
            catch
            {
                throw;
            }
        }

        public bool GuardarUsuario(List<Usuario> _Usuario)
        {
            try
            {
                return _spaRepository.GuardarUsuario(_Usuario);
            }
            catch
            {
                throw;
            }
        }

        public Usuario ValidarUsuarioAdmin(string Nombre, string Password)
        {
            try
            {
                Usuario _usuario = _spaRepository.ValidarUsuarioAdmin(Nombre, Password);

                return _usuario;
            }
            catch
            {
                throw;
            }
        }

        public List<Empresa> ConsultarEmpresas()
        {
            try
            {
                List<Empresa> _empresas = _spaRepository.ConsultarEmpresas();

                return _empresas;
            }
            catch
            {
                throw;
            }
        }

        public List<Empresa> ConsultarUsuarioEmpresas(int IdUsuario)
        {
            try
            {
                List<Empresa> _empresas = _spaRepository.ConsultarUsuarioEmpresas(IdUsuario);

                return _empresas;
            }
            catch
            {
                throw;
            }
        }
    }
}
