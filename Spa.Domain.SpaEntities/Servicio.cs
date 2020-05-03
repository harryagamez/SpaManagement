using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Servicio: BusquedaServicio
    {
        public int Id_Servicio { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public int Tiempo { get; set; }
        public float Valor { get; set; }
        public int Id_TipoServicio { get; set; }
        public string Estado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}
