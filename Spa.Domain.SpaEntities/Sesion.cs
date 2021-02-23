namespace Spa.Domain.SpaEntities
{
    public class Sesion
    {
        public int Id_Registro { get; set; }
        public string Usuario_Registro { get; set; }
        public string Ip_Address { get; set; }
        public string Hostname { get; set; }
        public string Ciudad { get; set; }
        public string Region { get; set; }
        public string Pais { get; set; }
        public string Localizacion { get; set; }
        public string Org { get; set; }
        public string Codigo_Postal { get; set; }
        public string Zona_Horaria { get; set; }
        public string Id_Empresa { get; set; }
    }
}
