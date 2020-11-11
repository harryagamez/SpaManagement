﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Spa.Domain.SpaEntities
{
    public class MovimientoCajaMenor
    {        

        public float Saldo_Inicial { get; set; }

        public float Acumulado { get; set; }

        public DateTime Fecha { get; set; }

        public float Compras { get; set; }

        public float Nomina { get; set; }

        public float Prestamos { get; set; }

        public float Servicios { get; set; }

        public float Varios { get; set; }

        public float Facturado { get; set; }

    }
}