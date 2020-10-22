using System;

namespace Spa.Domain.SpaEntities
{
    public class ClientePago
    {
        public string Id_ClientePago { get; set; }
        public string Id_Cliente { get; set; }
        public DateTime? Fecha { get; set; }
        public float SubTotal { get; set; }
        public float Descuento { get; set; }
        public float Total { get; set; }
        public string Id_Empresa { get; set; }
    }
}