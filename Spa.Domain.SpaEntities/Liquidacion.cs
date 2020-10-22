using System;

namespace Spa.Domain.SpaEntities
{
    public class Liquidacion
    {
        public int Id_Registro { get; set; }
        public DateTime? Fecha { get; set; }
        public string Id_Empleado { get; set; }
        public float Subtotal { get; set; }
        public float Total_Prestamos { get; set; }
        public float Total_Pagado { get; set; }
    }
}