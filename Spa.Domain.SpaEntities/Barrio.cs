using Spa.Domain.SpaEntities.Extensions;

namespace Spa.Domain.SpaEntities
{
    public class Barrio : BusquedaBarrio
    {
        public int Id_Barrio { get; set; }
        public string Nombre { get; set; }
        public int Id_Municipio { get; set; }
        public string Codigo { get; set; }
        public string Id_Object { get; set; }
    }
}
