CREATE PROCEDURE GuardarCategoriaServicio(@JsonCategoriaServicio NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempCategoriaServicios(Id_Categoria_Servicio VARCHAR(36), Nombre CHAR(50) COLLATE SQL_Latin1_General_CP1_CI_AS, Descripcion CHAR(250) COLLATE SQL_Latin1_General_CP1_CI_AS)

	INSERT INTO #TempCategoriaServicios (Id_Categoria_Servicio, Nombre, Descripcion)
	SELECT 
		Id_Categoria_Servicio, Nombre, Descripcion
	FROM 
		OPENJSON(@JsonCategoriaServicio)
	WITH (
		Id_Categoria_Servicio UNIQUEIDENTIFIER '$.Id_Categoria_Servicio', Nombre CHAR(50) '$.Nombre',
		Descripcion CHAR(250) '$.Descripcion'
	)	

	BEGIN TRY
		
		MERGE CATEGORIA_SERVICIOS AS TARGET
		USING #TempCategoriaServicios AS SOURCE
		ON TARGET.ID_CATEGORIA_SERVICIO = SOURCE.Id_Categoria_Servicio OR TARGET.NOMBRE = UPPER(SOURCE.Nombre)
		WHEN MATCHED THEN
			UPDATE SET TARGET.DESCRIPCION = SOURCE.Descripcion
		WHEN NOT MATCHED THEN
			INSERT (ID_CATEGORIA_SERVICIO, NOMBRE, DESCRIPCION)
			VALUES (NEWID(), SOURCE.Nombre, SOURCE.Descripcion);

		IF OBJECT_ID('tempdb..#TempCategoriaServicios') IS NOT NULL DROP TABLE #TempCategoriaServicios

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempCategoriaServicios') IS NOT NULL DROP TABLE #TempCategoriaServicios

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO