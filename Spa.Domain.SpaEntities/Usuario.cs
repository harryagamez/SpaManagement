﻿using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Usuario : BusquedaUsuario
    {
        public int Id_Usuario { get; set; }
        public string Nombre { get; set; }
        public string Contrasenia { get; set; }
        public string Perfil { get; set; }
        public Guid Id_Empresa { get; set; }
        public string Codigo_Integracion { get; set; }
        public bool Verificado { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string HashKey { get; set; } = string.Empty;
        public string Mail { get; set; }
    }
}
