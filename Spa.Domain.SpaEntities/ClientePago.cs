using System;

namespace Spa.Domain.SpaEntities
{
    public class ClientePago
    {
        public string Id_ClientePago { get; set; }
        public string Id_Cliente { get; set; }
        public DateTime? Fecha { get; set; }
        public float Total_Servicios { get; set; }
        public float Total_Promocion { get; set; }
        public float Total_Servicios_NoPromocion { get; set; }
        public float Total_Productos { get; set; }
        public float Descuento { get; set; }
        public float Total_Pagado { get; set; }
        public string Id_Empresa { get; set; }
        public string NombreApellido_Cliente { get; set; } = string.Empty;
    }
}