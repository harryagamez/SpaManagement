using System;
using System.Collections.Generic;
using System.Text;

namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaPago
    {
        public int Id_Cliente { get; set; }
        
        public DateTime Fecha_Desde { get; set; }

        public DateTime Fecha_Hasta { get; set; }

        public DateTime Fecha { get; set; }

        public string Id_Empresa { get; set; }

        public string NombreApellido_Cliente { get; set; }

        public float Subtotal { get; set; }
        
        public float Descuento { get; set; }

        public float Total { get; set; }
    }
}
