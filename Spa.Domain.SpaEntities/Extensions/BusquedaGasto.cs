using System;

namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaGasto
    {
        public DateTime Fecha_Desde { get; set; }
        public DateTime Fecha_Hasta { get; set; }
        public string Tipo_Gasto { get; set; }
        public string Id_Empresa { get; set; }
        public string Nombre_Empleado { get; set; }
    }
}