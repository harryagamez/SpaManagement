﻿using Spa.Domain.SpaEntities.Extensions;
using System;

namespace Spa.Domain.SpaEntities
{
    public class Transaccion : BusquedaProductoTransaccion
    {
        public int Id_Transaccion { get; set; }
        public DateTime? Fecha { get; set; }
        public int Id_Producto { get; set; }
        public int Cantidad { get; set; }
        public int Id_TipoTransaccion { get; set; }
        public int Id_EmpleadoCliente { get; set; }
        public DateTime? Fecha_Registro { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
        public string Id_Empresa { get; set; }
    }
}