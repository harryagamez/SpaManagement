using System;
using System.Collections.Generic;

namespace Spa.Domain.SpaEntities
{
    public class AplicacionNomina
    {
        public List<Liquidacion> Empleados { get; set; }
        public DateTime Fecha_Nomina { get; set; }
        public string Id_Empresa { get; set; }
        public decimal Total_Nomina { get; set; }
        public string Usuario_Registro { get; set; }
    }
}