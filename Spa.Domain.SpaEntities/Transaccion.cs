using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Transaccion : BusquedaProductoTransaccion
    {
        public int Id_Transaccion { get; set; }
        public DateTime? Fecha { get; set; }
        public int Id_Producto { get; set; }
        public int Cantidad { get; set; }
        public int Id_TipoTransaccion { get; set; }
        public int? Id_Empleado { get; set; }
        public int? Id_Cliente { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public string Usuario_Registro { get; set; } = string.Empty;
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}