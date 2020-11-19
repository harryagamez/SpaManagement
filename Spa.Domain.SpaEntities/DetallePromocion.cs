using Spa.Domain.SpaEntities.Extensions;

namespace Spa.Domain.SpaEntities
{
    public class DetallePromocion: BusquedaPromocion
    {
        public string Id_Detalle_Promocion { get; set; }
        public string Id_Promocion { get; set; }
        public string Id_Empresa_Servicio { get; set; }
    }
}
