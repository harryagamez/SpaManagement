using System;

namespace Spa.Domain.SpaEntities
{
    public class MenuUsuario
    {
        public string Id_Menu_Usuario { get; set; }
        public int Id_Usuario { get; set; }
        public int Id_Menu { get; set; }
        public bool Estado { get; set; }
        public DateTime Fecha_Registro { get; set; }
        public DateTime Fecha_Modificacion { get; set; }
        public string Descripcion { get; set; }
    }
}