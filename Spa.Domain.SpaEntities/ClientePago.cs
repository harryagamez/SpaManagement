using System;

namespace Spa.Domain.SpaEntities
{
    public class ClientePago
    {
        public string Id_ClientePago { get; set; }
        public string Id_Cliente { get; set; }
        public DateTime? Fecha { get; set; }
        public decimal Total_Servicios { get; set; }
        public decimal Total_Promocion { get; set; }
        public decimal Total_Servicios_NoPromocion { get; set; }
        public decimal Total_Productos { get; set; }
        public double Descuento { get; set; }
        public decimal Total_Pagado { get; set; }
        public string Id_Empresa { get; set; }
        public string NombreApellido_Cliente { get; set; } = string.Empty;
        public string Usuario_Creacion { get; set; } = string.Empty;
        public string Usuario_Modificacion { get; set; } = string.Empty;
    }
}