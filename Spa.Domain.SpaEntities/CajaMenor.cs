using System;

namespace Spa.Domain.SpaEntities
{
    public class CajaMenor
    {
        public int Id_Registro { get; set; }
        public int Anio { get; set; }
        public int Mes { get; set; }
        public DateTime? Dia { get; set; }
        public string Distribucion { get; set; }
        public int? Quincena { get; set; }
        public decimal Saldo_Inicial { get; set; }
        public decimal Acumulado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
        public string Usuario_Registro { get; set; } = string.Empty;        
        public string Usuario_Modificacion { get; set; } = string.Empty;
    }
}