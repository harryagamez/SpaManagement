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
        public DateTime? Fecha_Creacion { get; set; }
        public string Usuario_Creacion { get; set; } = string.Empty;
    }
}