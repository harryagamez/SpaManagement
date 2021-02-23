using System.Collections.Generic;
using Spa.Domain.SpaEntities.Extensions;

namespace Spa.Domain.SpaEntities
{
    public class AplicacionPago : BusquedaPago
    {
        public List<Agenda> Agendas { get; set; }

        public List<Transaccion> Transacciones { get; set; }

        public ClientePago Cliente_Pago { get; set; }      
    }
}