using Spa.Domain.SpaEntities.Extensions;
using System;
using System.Collections.Generic;

namespace Spa.Domain.SpaEntities
{
    public class Servicio : BusquedaServicio
    {
        public string Id_Empresa_Servicio { get; set; }
        public string Id_Empresa { get; set; }
        public int Id_Servicio { get; set; }
        public int Tiempo { get; set; }
        public float Valor { get; set; }
        public List<ImagenServicio> Imagenes_Servicio { get; set; }
        public string Estado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
    }
}