CREATE PROCEDURE ConsultarServiciosMaestro(
	@CategoriaEmpresa VARCHAR(36)
)
AS
 BEGIN

	SELECT
		ID_SERVICIO, RTRIM(NOMBRE) AS NOMBRE, RTRIM(DESCRIPCION) AS DESCRIPCION, 
		ID_TIPOSERVICIO, CAST(ID_CATEGORIA_SERVICIO AS VARCHAR(36)) AS ID_CATEGORIA_SERVICIO, 
		FECHA_REGISTRO, FECHA_MODIFICACION        
	FROM SERVICIOS 
    WHERE ID_CATEGORIA_SERVICIO = @CategoriaEmpresa

 END

 GO
