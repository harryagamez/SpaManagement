namespace Spa.Domain.SpaEntities
{
    public class Empresa
    {
        public string Id_Empresa { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Direccion { get; set; }
        public string Telefono_Fijo { get; set; }
        public string Telefono_Movil { get; set; }
        public string Mail { get; set; }
        public string Logo { get; set; }
        public string Id_SedePrincipal { get; set; }
        public string Id_Categoria_Servicio { get; set; }
        public string Estado { get; set; }
    }
}
