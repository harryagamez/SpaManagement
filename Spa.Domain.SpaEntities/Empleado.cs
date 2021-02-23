using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Empleado : BusquedaEmpleado
    {
        public int Id_Empleado { get; set; }
        public string Cedula { get; set; } = string.Empty;
        public string Id_TipoPago { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string Telefono_Fijo { get; set; } = string.Empty;
        public string Telefono_Movil { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public int Id_Barrio { get; set; }
        public DateTime? Fecha_Nacimiento { get; set; }
        public string Estado_Civil { get; set; } = string.Empty;
        public int Numero_Hijos { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime? Fecha_Registro { get; set; }
        public string Usuario_Registro { get; set; } = string.Empty;
        public DateTime? Fecha_Modificacion { get; set; }
        public string Usuario_Modificacion { get; set; } = string.Empty;
        public string Id_Empresa { get; set; } = string.Empty;
        public string Logo_Base64 { get; set; } = string.Empty;
    }
}