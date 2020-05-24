using System;

namespace Spa.Domain.SpaEntities
{
    public class Gasto
    {
        public int Id_Gasto { get; set; }
        public string Tipo_Gasto { get; set; }
        public string Descripcion { get; set; }
        public float Valor { get; set; }
        public DateTime? Fecha { get; set; }
        public string Estado { get; set; }
        public int Id_Empleado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}
