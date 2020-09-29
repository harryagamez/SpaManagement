CREATE PROCEDURE GuardarMunicipio(@JsonMunicipio NVARCHAR(MAX))
AS
BEGIN
	
	DECLARE @IdMunicipio INT
	DECLARE @Nombre CHAR(30)	
	DECLARE @Mensaje VARCHAR(200)

	SELECT 
		@IdMunicipio = Id_Municipio, @Nombre = Nombre
	FROM 
		OPENJSON(@JsonMunicipio)
	WITH (
		Id_Municipio INT '$.Id_Municipio', Nombre CHAR(30) '$.Nombre'
	)
	
	IF (SELECT COUNT(*) FROM MUNICIPIOS WHERE ID_MUNICIPIO = @IdMunicipio OR NOMBRE = @Nombre) > 0 BEGIN
		SET @Mensaje = 'Ya existe un municipio con ese nombre.'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END
	
	CREATE TABLE #TempMunicipios(Id_Municipio INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS)

	INSERT INTO #TempMunicipios (Id_Municipio, Nombre)
	SELECT 
		Id_Municipio, Nombre
	FROM 
		OPENJSON(@JsonMunicipio)
	WITH (
		Id_Municipio INT '$.Id_Municipio', Nombre CHAR(30) '$.Nombre'		
	)	

	BEGIN TRY
		
		MERGE MUNICIPIOS AS TARGET
		USING #TempMunicipios AS SOURCE
		ON TARGET.ID_MUNICIPIO = SOURCE.Id_Municipio OR TARGET.NOMBRE = UPPER(SOURCE.Nombre)		
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE)
			VALUES (UPPER(SOURCE.Nombre));

		IF OBJECT_ID('tempdb..#TempMunicipios') IS NOT NULL DROP TABLE #TempMunicipios

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempMunicipios') IS NOT NULL DROP TABLE #TempMunicipios

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END
