using System.Collections.Generic;

namespace Spa.Domain.SpaEntities
{
    public class AplicacionPago
    {
        public List<Agenda> Agendas { get; set; }
        public List<Transaccion> Transacciones { get; set; }
        public ClientePago Cliente_Pago { get; set; }
    }
}