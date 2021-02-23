using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Cliente : BusquedaCliente
    {
        public int Id_Cliente { get; set; }
        public string Cedula { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Telefono_Fijo { get; set; }
        public string Telefono_Movil { get; set; }
        public string Mail { get; set; }
        public string Direccion { get; set; }
        public int Id_Barrio { get; set; }
        public DateTime? Fecha_Nacimiento { get; set; }
        public int Id_Tipo { get; set; }
        public string Estado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public string Usuario_Registro { get; set; } = string.Empty;
        public DateTime? Fecha_Modificacion { get; set; }
        public string Usuario_Modificacion { get; set; } = string.Empty;
        public string Id_Empresa { get; set; }
    }
}