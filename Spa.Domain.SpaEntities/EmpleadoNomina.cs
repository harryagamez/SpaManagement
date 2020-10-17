namespace Spa.Domain.SpaEntities
{
    public class EmpleadoNomina
    {
        public string Id_Empresa { get; set; }
        public int Id_Empleado { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public double Servicios { get; set; }
        public double Prestamos { get; set; }
        public double Salario { get; set; }
        public double Total_Aplicado { get; set; }
        public double Total_Pagar { get; set; }
        public string Tipo_Nomina { get; set; }
    }
}