using System;

namespace Spa.Domain.SpaEntities
{
    public class Encuesta
    {
        public int Id_Registro { get; set; }
        public int Id_Encuesta { get; set; }
        public string Id_Empleado { get; set; }
        public int Id_Servicio { get; set; }
        public string Aspecto { get; set; }
        public string Criterio { get; set; }
        public DateTime? Fecha { get; set; }
        public int Peso { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
    }
}
