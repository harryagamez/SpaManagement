using System;

namespace Spa.Domain.SpaEntities
{
    public class Empleado
    {
        public int Id_Empleado { get; set; }
        public string Cedula { get; set; }
        public string Id_TipoPago { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Telefono_Fijo { get; set; }
        public string Telefono_Movil { get; set; }
        public string Direccion { get; set; }
        public int Id_Barrio { get; set; }
        public DateTime? Fecha_Nacimiento { get; set; }
        public string Estado_Civil { get; set; }
        public int Numero_Hijos { get; set; }
        public string Estado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}
