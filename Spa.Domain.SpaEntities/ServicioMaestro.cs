﻿using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class ServicioMaestro : BusquedaServicio
    {
        public int Id_Servicio { get; set; }
        public string Id_Categoria_Servicio { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
    }
}