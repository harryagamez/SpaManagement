CREATE PROCEDURE GuardarTipoServicio(@JsonTipoServicio NVARCHAR(MAX))
AS
BEGIN

	DECLARE @IdCategoriaServicio VARCHAR(36)
	DECLARE @Nombre CHAR(30)
	DECLARE @IdTipoServicio INT
	DECLARE @Mensaje VARCHAR(200)

	SELECT 
		@IdCategoriaServicio = Id_Categoria_Servicio, @Nombre = Nombre, @IdTipoServicio = Id_TipoServicio
	FROM 
		OPENJSON(@JsonTipoServicio)
	WITH (
		Id_Categoria_Servicio UNIQUEIDENTIFIER '$.Id_Categoria_Servicio', Nombre CHAR(30) '$.Nombre', Id_TipoServicio INT '$.Id_TipoServicio'
	)
	
	IF (SELECT COUNT(*) FROM TIPO_SERVICIO WHERE ID_CATEGORIA_SERVICIO = @IdCategoriaServicio AND NOMBRE = @Nombre AND ID_TIPOSERVICIO <> @IdTipoServicio) > 0 BEGIN
		SET @Mensaje = 'Ya existe un Tipo de Servicio con ese nombre asociado a esa categoría. Debe digitar otro nombre o seleccionar otra categoría.'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END
	
	CREATE TABLE #TempTipoServicio(Id_TipoServicio INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS, Descripcion CHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Categoria_Servicio VARCHAR(36))

	INSERT INTO #TempTipoServicio (Id_TipoServicio, Nombre, Descripcion, Id_Categoria_Servicio)
	SELECT 
		Id_TipoServicio, Nombre, Descripcion, Id_Categoria_Servicio
	FROM 
		OPENJSON(@JsonTipoServicio)
	WITH (
		Id_TipoServicio INT '$.Id_TipoServicio', Nombre CHAR(30) '$.Nombre',
		Descripcion CHAR(100) '$.Descripcion', Id_Categoria_Servicio UNIQUEIDENTIFIER '$.Id_Categoria_Servicio'
	)	

	BEGIN TRY
		
		MERGE TIPO_SERVICIO AS TARGET
		USING #TempTipoServicio AS SOURCE
		ON TARGET.ID_TIPOSERVICIO = SOURCE.Id_TipoServicio OR TARGET.NOMBRE = UPPER(SOURCE.Nombre)
		WHEN MATCHED THEN
			UPDATE SET TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.ID_CATEGORIA_SERVICIO = SOURCE.Id_Categoria_Servicio
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, DESCRIPCION, ID_CATEGORIA_SERVICIO)
			VALUES (SOURCE.Nombre, SOURCE.Descripcion, SOURCE.Id_Categoria_Servicio);

		IF OBJECT_ID('tempdb..#TempTipoServicio') IS NOT NULL DROP TABLE #TempTipoServicio

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempTipoServicio') IS NOT NULL DROP TABLE #TempTipoServicio

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO