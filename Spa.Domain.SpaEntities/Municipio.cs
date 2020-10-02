using Spa.Domain.SpaEntities.Extensions;

namespace Spa.Domain.SpaEntities
{
    public class Municipio : BusquedaMunicipio
    {
        public int Id_Municipio { get; set; }
        public string Nombre { get; set; }
        public string Id_Departamento { get; set; }
    }
}
