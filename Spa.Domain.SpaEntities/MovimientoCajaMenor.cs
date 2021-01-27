namespace Spa.Domain.SpaEntities
{
    public class MovimientoCajaMenor
    {        
        public decimal SaldoInicial { get; set; }
        public decimal Acumulado { get; set; }
        public string Fecha { get; set; }
        public decimal Compras { get; set; }
        public decimal Nomina { get; set; }
        public decimal Prestamos { get; set; }
        public decimal Servicios { get; set; }
        public decimal Varios { get; set; }
        public decimal Facturado { get; set; }
    }
}
