using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Producto : BusquedaProducto
    {
        public int Id_Producto { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public float Precio { get; set; }
        public int Inventario { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public string Usuario_Registro { get; set; } = string.Empty;
        public DateTime? Fecha_Modificacion { get; set; }
        public string Usuario_Modificacion { get; set; } = string.Empty;
        public string Id_Empresa { get; set; }
    }
}