using System;
using System.Collections.Generic;

namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaAgenda: BusquedaAplicacionPromocion
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
        public string FechaCita { get; set; }
        public string Mail_Cliente { get; set; }
        public string Telefono_Fijo_Cliente { get; set; }
        public string Telefono_Movil_Cliente { get; set; }
        public bool Traer_Canceladas { get; set; }
        public float Valor_Servicio { get; set; }
        public string Tipo_Nomina { get; set; }
        public List<int> Id_Servicios { get; set; }
        public DateTime Fecha_Desde { get; set; }
        public DateTime Fecha_Hasta { get; set; }
    }
}