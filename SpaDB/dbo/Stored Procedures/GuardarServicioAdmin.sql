CREATE PROCEDURE [dbo].[GuardarServicioAdmin](
	@JsonServicio NVARCHAR(MAX)
)
AS
BEGIN
	
	CREATE TABLE #TempServicios(Id_Servicio INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS, Descripcion CHAR(300) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_TipoServicio INT, Id_Categoria_Servicio VARCHAR(36))

	INSERT INTO #TempServicios (Id_Servicio, Nombre, Descripcion, Id_TipoServicio, Id_Categoria_Servicio)
	SELECT 
		Id_Servicio, Nombre, Descripcion, Id_TipoServicio, Id_Categoria_Servicio
	FROM 
		OPENJSON(@JsonServicio)
	WITH (
		Id_Servicio INT '$.Id_Servicio', Nombre CHAR(30) '$.Nombre',
		Descripcion CHAR(300) '$.Descripcion', Id_TipoServicio INT '$.Id_TipoServicio',
		Id_Categoria_Servicio UNIQUEIDENTIFIER '$.Id_Categoria_Servicio'
	)	

	BEGIN TRY
		
		MERGE SERVICIOS AS TARGET
		USING #TempServicios AS SOURCE
		ON TARGET.ID_SERVICIO = SOURCE.Id_Servicio OR TARGET.NOMBRE = UPPER(SOURCE.Nombre)
		WHEN MATCHED THEN
			UPDATE SET TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.ID_TIPOSERVICIO = SOURCE.Id_TipoServicio,
			TARGET.ID_CATEGORIA_SERVICIO = SOURCE.Id_Categoria_Servicio, TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, DESCRIPCION, ID_TIPOSERVICIO, ID_CATEGORIA_SERVICIO, FECHA_REGISTRO, FECHA_MODIFICACION)
			VALUES (UPPER(SOURCE.Nombre), SOURCE.Descripcion, SOURCE.Id_TipoServicio, SOURCE.Id_Categoria_Servicio, GETDATE(), GETDATE());

		IF OBJECT_ID('tempdb..#TempServicios') IS NOT NULL DROP TABLE #TempServicios

	END TRY

	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempServicios') IS NOT NULL DROP TABLE #TempServicios
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO