namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaAgenda
    {
        public string Nombres_Cliente { get; set; }
        public string Nombre_Empresa { get; set; }
        public string Apellidos_Cliente { get; set; }
        public string Nombres_Empleado { get; set; }
        public string Apellidos_Empleado { get; set; }
        public string NombreApellido_Empleado { get; set; }
        public string NombreApellido_Cliente { get; set; }
        public string Nombre_Servicio { get; set; }
        public string FechaInicio { get; set; }
        public string FechaFin { get; set; }
        public string Mail_Cliente { get; set; } 
        public bool fShowCanceladas { get; set; }

    }
}
