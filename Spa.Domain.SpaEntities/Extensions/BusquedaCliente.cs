namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaCliente
    {
        public string Barrio { get; set; } = string.Empty;
        public int Id_Municipio { get; set; }
        public string Id_Departamento { get; set; }
        public string Tipo_Cliente { get; set; }
    }
}