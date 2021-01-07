using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Gasto : BusquedaGasto
    {
        public int Id_Gasto { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public float Valor { get; set; }
        public DateTime? Fecha { get; set; }
        public string Estado { get; set; } = string.Empty;
        public int? Id_Empleado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public string Usuario_Registro { get; set; } = string.Empty;
        public DateTime? Fecha_Modificacion { get; set; }
        public string Usuario_Modificacion { get; set; } = string.Empty;
    }
}