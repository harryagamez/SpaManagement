using System;

namespace Spa.Domain.SpaEntities
{
    public class TipoServicio
    {
        public int Id_TipoServicio { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
    }
}
