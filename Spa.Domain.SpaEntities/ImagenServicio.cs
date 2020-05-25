namespace Spa.Domain.SpaEntities
{
    public class ImagenServicio
    {
        public string Id_Servicio_Imagen { set; get; }
        public int Id_Servicio { set; get; }
        public string Imagen_Base64 { set; get; }
        public bool TuvoCambios { set; get; }
       
    }
}
