using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class EmpleadoServicio : BusquedaServicioTipo
    {
        public int Id_Empleado_Servicio { get; set; }
        public int Id_Empleado { get; set; }
        public string Id_Empresa_Servicio { get; set; }
        public int Id_Servicio { get; set; }
        public float? Aplicacion_Nomina { get; set; }
        public DateTime? Fecha_Creacion { get; set; }
        public string Usuario_Creacion { get; set; } = string.Empty;
        public DateTime? Fecha_Modificacion { get; set; }
        public string Usuario_Modificacion { get; set; } = string.Empty;
    }
}