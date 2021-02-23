using System;

namespace Spa.Domain.SpaEntities
{
    public class CalificacionServicio
    {
        public int Id_Calificacion_Servicio { get; set; }
        public int Id_EmpleadoServicio { get; set; }
        public string Calificacion_Servicio { get; set; }
        public string Calificacion_Actitudinal { get; set; }
        public DateTime? Fecha { get; set; }
    }
}