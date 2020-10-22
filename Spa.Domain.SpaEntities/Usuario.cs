using Spa.Domain.SpaEntities.Extensions;
using System;
using System.Collections.Generic;

namespace Spa.Domain.SpaEntities
{
    public class Usuario : BusquedaUsuario
    {
        public int Id_Usuario { get; set; }
        public string Nombre { get; set; }
        public string Contrasenia { get; set; }
        public string Perfil { get; set; }
        public string Id_Empresa { get; set; }
        public List<MenuUsuario> Menu_Usuario { get; set; }
        public string Codigo_Integracion { get; set; }
        public bool Verificado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string HashKey { get; set; } = string.Empty;
        public string Mail { get; set; }
        public string Logo_Base64 { set; get; }
    }
}