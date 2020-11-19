using System;
using System.Collections.Generic;
using Spa.Domain.SpaEntities.Extensions;

namespace Spa.Domain.SpaEntities
{
    public class Promocion : BusquedaPromocion
    {
        public string Id_Promocion { get; set; }
        public string Id_Tipo_Promocion { get; set; }
        public string Descripcion { get; set; }
        public decimal Valor { get; set; }
        public string Estado { get; set; }
        public string Id_Empresa { get; set; }
        public DateTime Fecha_Creacion { get; set; }
        public string Usuario_Creacion { get; set; }
        public DateTime Fecha_Modificacio { get; set; }
        public string Usuario_Modificacion { get; set; }
        public List<DetallePromocion> Detalles_Promocion { get; set; } = new List<DetallePromocion>();
    }
}
