using System;
using System.Collections.Generic;
using System.Text;

namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaPromocion
    {
        public string Nombre_Servicio { get; set; }

        public string Tipo_Promocion { get; set; }

        public bool Has_Changed { get; set; }
    }
}
