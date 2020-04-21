using System;

namespace Spa.Domain.SpaEntities
{
    public class CajaMenor
    {
        public int Id_Registro { get; set; }
        public int Año { get; set; }
        public int Mes { get; set; }
        public DateTime? Dia { get; set; }
        public int? Quincena { get; set; }
        public float Saldo_Inicial { get; set; }
        public float Acumulado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}
