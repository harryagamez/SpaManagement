using System;

namespace Spa.Domain.SpaEntities
{
    public class Visita
    {
        public int Id_Visita { get; set; }
        public string Id_Cliente { get; set; }
        public DateTime? Fecha { get; set; }
        public float SubTotal { get; set; }
        public float Descuento { get; set; }
        public float Total { get; set; }
    }
}
