using System;

namespace Spa.Domain.SpaEntities
{
    public class Producto
    {
        public int Id_Producto { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public float Precio { get; set; }
        public int Inventario { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}
