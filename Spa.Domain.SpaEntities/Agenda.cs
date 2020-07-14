﻿using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Agenda : BusquedaAgenda
    {
        public int Id_Agenda { get; set; }
        public DateTime? Fecha_Inicio { get; set; }
        public DateTime? Fecha_Fin { get; set; }
        public int Id_Cliente { get; set; }
        public int Id_Servicio { get; set; }
        public int Id_Empleado { get; set; }
        public string Estado { get; set; }
        public string Id_Empresa { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Observaciones { get; set; }
    }
}
