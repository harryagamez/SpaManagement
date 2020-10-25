CREATE PROCEDURE GuardarMunicipio(
	@JsonMunicipio NVARCHAR(MAX)
)
AS
BEGIN
	
	DECLARE @IdMunicipio INT
	DECLARE @Nombre CHAR(30)	
	DECLARE @Mensaje VARCHAR(200)
	DECLARE @IdDepartamento VARCHAR(36)

	SELECT 
		@IdMunicipio = Id_Municipio, @Nombre = Nombre, @IdDepartamento = Id_Departamento
	FROM 
		OPENJSON(@JsonMunicipio)
	WITH (
		Id_Municipio INT '$.Id_Municipio', Nombre CHAR(30) '$.Nombre', Id_Departamento UNIQUEIDENTIFIER '$.Id_Departamento'
	)
	
	IF (SELECT COUNT(*) FROM MUNICIPIOS WHERE ID_DEPARTAMENTO = @IdDepartamento AND NOMBRE = UPPER(@Nombre) AND ID_MUNICIPIO <> @IdMunicipio) > 0 BEGIN
		SET @Mensaje = 'Ya existe un municipio con ese nombre en el departamento seleccionado.'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END
	
	CREATE TABLE #TempMunicipios(Id_Municipio INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Departamento VARCHAR(36))

	INSERT INTO #TempMunicipios (Id_Municipio, Nombre, Id_Departamento)
	SELECT 
		Id_Municipio, Nombre, Id_Departamento
	FROM 
		OPENJSON(@JsonMunicipio)
	WITH (
		Id_Municipio INT '$.Id_Municipio', Nombre CHAR(30) '$.Nombre', Id_Departamento UNIQUEIDENTIFIER '$.Id_Departamento'	
	)	

	BEGIN TRY
		
		MERGE MUNICIPIOS AS TARGET
		USING #TempMunicipios AS SOURCE
		ON TARGET.ID_MUNICIPIO = SOURCE.Id_Municipio AND TARGET.NOMBRE = UPPER(SOURCE.Nombre)
		WHEN MATCHED THEN
		UPDATE SET TARGET.ID_DEPARTAMENTO = SOURCE.Id_Departamento
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, ID_DEPARTAMENTO)
			VALUES (UPPER(SOURCE.Nombre), SOURCE.Id_Departamento);

		IF OBJECT_ID('tempdb..#TempMunicipios') IS NOT NULL DROP TABLE #TempMunicipios

	END TRY

	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempMunicipios') IS NOT NULL DROP TABLE #TempMunicipios

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO
