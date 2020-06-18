using Spa.Domain.SpaEntities;
using Spa.Domain.SpaEntities.Extensions;
using Spa.InfraCommon.SpaCommon.Helpers;
using Spa.InfraCommon.SpaCommon.Models;
using Spa.Infrastructure.SpaRepository;
using System;
using System.Collections.Generic;

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
                string encryptedPassword = SecurityHelper.EncryptPasswordHash(Password);

                Usuario _usuario = _spaRepository.ValidarUsuario(Nombre, encryptedPassword, ValidarIntegracion, CodigoIntegracion);

                if (_usuario != null)
                {
                    string htmlString = @"<!DOCTYPE html PUBLIC ' -//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
                    <html xmlns='http://www.w3.org/1999/xhtml'>
                    <head>
                        <meta http-equiv='Content - Type' content='text / html; charset = UTF - 8'/>
                        <meta name = 'viewport' content = 'width=device-width, initial-scale=1.0'/>
                    </head>
                    <body style='margin: 0; padding: 0;'>
                           <table align='center' border='0' cellpadding='0' cellspacing='0' width='900'>
                           <tr>
                           <td align='center' bgcolor='#ffffff' style='padding: 30px 0 30px 0;'>
                               <img src='https://i.imgur.com/JsBabEb.jpg' alt='SPA MANAGEMENT' style='display: block; max-width:900px;'/>
                           </td>
                           </tr>
                           <tr>
                           <td bgcolor='#ffffff' style='padding: 20px 30px 20px 30px; color: #1360a7; font-size:20px; text-align:center;'>
                                <h2>¡Hola!, " + _usuario.Nombre + @"</h2>
                           </td>                           
                           </tr>
                            <tr>
                           <td bgcolor='#ffffff' style='padding: 20px 30px 20px 30px; color: grey; font-size:18px;'>
                                <b>Gracias por crear una cuenta en SPA MANAGEMENT. Pero antes de poder acceder al sistema, deberá activar su cuenta. El siguiente es su código de activación:</b>                                
                           </td>                           
                           </tr>
                           <tr>
                           <td bgcolor='#ffffff' style='padding: 5px 30px 5px 30px; color: grey; font-size:16px; text-align:center;'>
                                <p>" + _usuario.HashKey + @"</p>
                           </td>                           
                           </tr>
                           <tr>
                           <td bgcolor='#212121' style='padding: 10px 30px 10px 30px; text-align:center; color: white;' >
                            <p>SPA MANAGEMENT © Todos los derechos reservados</p>
                           </td>                           
                           </tr>
                           </table>                            
                    </body>                    
                    </html>
                    ";

                    if (_usuario.Codigo_Integracion == null)
                    {
                        EmailModel _emailModel = new EmailModel
                        {
                            MailTo = _usuario.Mail,
                            Subject = "Activación cuenta de usuario - SpaManagement",                            
                            Body = htmlString
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
            return _spaRepository.RegistrarActualizarCliente(_Cliente);
        }

        public List<Menu> ConsultarMenu(int IdUsuario, string IdEmpresa, string Perfil)
        {
            return _spaRepository.ConsultarMenu(IdUsuario, IdEmpresa, Perfil);
        }

        public List<Cliente> ConsultarClientes(string IdEmpresa)
        {
            return _spaRepository.ConsultarClientes(IdEmpresa);
        }

        public bool SincronizarBarrios(List<Properties> _Properties, string _Municipio)
        {
            return _spaRepository.SincronizarBarrios(_Properties, _Municipio);
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }

        public List<Municipio> ConsultarMunicipios()
        {
            return _spaRepository.ConsultarMunicipios();
        }

        public List<Barrio> ConsultarBarrios(int IdMunicipio)
        {
            return _spaRepository.ConsultarBarrios(IdMunicipio);
        }

        public List<TipoCliente> ConsultarTipoClientes()
        {
            return _spaRepository.ConsultarTipoClientes();
        }

        public Cliente ConsultarCliente(string Cedula, string IdEmpresa)
        {
            return _spaRepository.ConsultarCliente(Cedula, IdEmpresa);
        }

        public List<TipoServicio> ConsultarTipoServicios()
        {
            return _spaRepository.ConsultarTipoServicios();
        }

        public List<Servicio> ConsultarServicios(string IdEmpresa)
        {
            return _spaRepository.ConsultarServicios(IdEmpresa);
        }

        public bool GuardarServicio(List<Servicio> _Servicio)
        {
            return _spaRepository.GuardarServicio(_Servicio);
        }

        public bool EliminarImagenAdjunta(string IdImagenAdjunta)
        {
            return _spaRepository.EliminarImagenAdjunta(IdImagenAdjunta);
        }

        public List<Empleado> ConsultarEmpleados(string IdEmpresa)
        {
            return _spaRepository.ConsultarEmpleados(IdEmpresa);
        }

        public Empleado ConsultarEmpleado(string Cedula, string IdEmpresa)
        {
            return _spaRepository.ConsultarEmpleado(Cedula, IdEmpresa);
        }

        public List<TipoTransaccion> ConsultarTipoTransacciones()
        {
            return _spaRepository.ConsultarTipoTransacciones();
        }

        public List<Producto> ConsultarProductos(string IdEmpresa)
        {
            return _spaRepository.ConsultarProductos(IdEmpresa);
        }

        public List<TipoPago> ConsultarTipoPagos()
        {
            return _spaRepository.ConsultarTipoPagos();
        }

        public bool RegistrarActualizarEmpleado(List<Empleado> _Empleado)
        {
            return _spaRepository.RegistrarActualizarEmpleado(_Empleado);
        }

        public bool AsignarEmpleadoServicio(List<EmpleadoServicio> _EmpleadoServicio)
        {
            return _spaRepository.AsignarEmpleadoServicio(_EmpleadoServicio);
        }

        public bool DesasignarEmpleadoServicio(int IdEmpleadoServicio)
        {
            return _spaRepository.DesasignarEmpleadoServicio(IdEmpleadoServicio);
        }

        public bool EliminarEmpleadoInsumo(int IdTransaccion, int Cantidad, int IdProducto)
        {
            return _spaRepository.EliminarEmpleadoInsumo(IdTransaccion, Cantidad, IdProducto);
        }

        public bool AsignarEmpleadoInsumo(List<Transaccion> _EmpleadoInsumo)
        {
            return _spaRepository.AsignarEmpleadoInsumo(_EmpleadoInsumo);
        }

        public List<EmpleadoServicio> ConsultarEmpleadoServicio(int IdEmpleado)
        {
            return _spaRepository.ConsultarEmpleadoServicio(IdEmpleado);
        }

        public List<Transaccion> ConsultarEmpleadoInsumos(int IdEmpleado)
        {
            return _spaRepository.ConsultarEmpleadoInsumos(IdEmpleado);
        }

        public bool GuardarProducto(List<Producto> _Producto)
        {
            return _spaRepository.GuardarProducto(_Producto);
        }

        public List<Transaccion> ConsultarProductoTransacciones(int IdProducto, string IdEmpresa)
        {
            return _spaRepository.ConsultarProductoTransacciones(IdProducto, IdEmpresa);
        }

        public List<Gasto> ConsultarGastos(BusquedaGasto _BusquedaGasto)
        {
            return _spaRepository.ConsultarGastos(_BusquedaGasto);
        }

        public CajaMenor ConsultarCajaMenor(string IdEmpresa)
        {
            return _spaRepository.ConsultarCajaMenor(IdEmpresa);
        }

        public bool GuardarCajaMenor(List<CajaMenor> _CajaMenor)
        {
            return _spaRepository.GuardarCajaMenor(_CajaMenor);
        }

        public bool ReemplazarCajaMenor(List<CajaMenor> _CajaMenor)
        {
            return _spaRepository.ReemplazarCajaMenor(_CajaMenor);
        }

        public bool GuardarGasto(List<Gasto> _Gasto)
        {
            return _spaRepository.GuardarGasto(_Gasto);
        }

        public bool EliminarGastos(List<Gasto> _Gastos)
        {
            return _spaRepository.EliminarGastos(_Gastos);
        }

        public List<Usuario> ConsultarUsuarios(string IdEmpresa)
        {
            return _spaRepository.ConsultarUsuarios(IdEmpresa);
        }

        public bool ConsultarUsuario(string Nombre)
        {
            return _spaRepository.ConsultarUsuario(Nombre);
        }

        public bool GuardarUsuario(Usuario _Usuario)
        {
            if (_Usuario.PasswordHasChanged)
            {
                string encryptedPassword = SecurityHelper.EncryptPasswordHash(_Usuario.Contrasenia);
                _Usuario.Contrasenia = encryptedPassword;
            }

            return _spaRepository.GuardarUsuario(_Usuario);
        }

        public Usuario ValidarUsuarioAdmin(string Nombre, string Password)
        {
            string encryptedPassword = SecurityHelper.EncryptPasswordHash(Password);

            return _spaRepository.ValidarUsuarioAdmin(Nombre, encryptedPassword);
        }

        public Usuario ConsultarUserAvatar(int UserId, string IdEmpresa)
        {
            return _spaRepository.ConsultarUserAvatar(UserId, IdEmpresa);
        }

        public List<Empresa> ConsultarEmpresas()
        {
            return _spaRepository.ConsultarEmpresas();
        }

        public List<Empresa> ConsultarUsuarioEmpresas(int IdUsuario)
        {
            return _spaRepository.ConsultarUsuarioEmpresas(IdUsuario);
        }
    }
}