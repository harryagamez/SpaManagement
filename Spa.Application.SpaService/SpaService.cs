﻿using Spa.Domain.SpaEntities;
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
                string encryptedPassword = SecurityHelper.EncryptPasswordHash(Password);

                Usuario _usuario = _spaRepository.ValidarUsuario(Nombre, encryptedPassword, ValidarIntegracion, CodigoIntegracion);

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
            if(_Usuario.PasswordHasChanged)
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

        public Usuario ConsultarUserAvatar(int UserId)
        {
            return _spaRepository.ConsultarUserAvatar(UserId);
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
