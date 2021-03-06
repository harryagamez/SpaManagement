﻿using System;

namespace Spa.Domain.SpaEntities
{
    public class Menu
    {
        public int Id_Menu { get; set; }
        public string Ruta_Acceso { get; set; }
        public string Descripcion { get; set; }
        public string Logo_Base64 { get; set; }        
        public int _Level { get; set; }
        public int _ParentId { get; set; }
        public int _Children { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
    }
}