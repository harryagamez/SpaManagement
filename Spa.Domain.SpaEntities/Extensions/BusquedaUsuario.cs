using System;
using System.Collections.Generic;
using System.Text;

namespace Spa.Domain.SpaEntities.Extensions
{
    public class BusquedaUsuario
    {
        public string Usuario { get; set; }
        public string Password { get; set; }
        public bool ValidarIntegracion { get; set; }
        public string CodigoIntegracion { get; set; }
    }
}
