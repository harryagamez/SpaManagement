CREATE PROCEDURE GuardarBarrio(@JsonBarrio NVARCHAR(MAX))
AS
BEGIN
	
	DECLARE @IdMunicipio INT
	DECLARE @Nombre CHAR(50)
	DECLARE @IdBarrio INT
	DECLARE @Mensaje VARCHAR(200)

	SELECT 
		@IdMunicipio = Id_Municipio, @Nombre = Nombre, @IdBarrio = Id_Barrio
	FROM 
		OPENJSON(@JsonBarrio)
	WITH (
		Id_Municipio INT '$.Id_Municipio', Nombre CHAR(30) '$.Nombre', Id_Barrio INT '$.Id_Barrio'
	)
	
	IF (SELECT COUNT(*) FROM BARRIOS WHERE ID_MUNICIPIO = @IdMunicipio AND NOMBRE = @Nombre AND ID_BARRIO <> @IdBarrio) > 0 BEGIN
		SET @Mensaje = 'Ya existe un barrio con ese nombre en el municipio seleccionado.'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END
	
	CREATE TABLE #TempBarrios(Id_Barrio INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Municipio INT)

	INSERT INTO #TempBarrios (Id_Barrio, Nombre, Id_Municipio)
	SELECT 
		Id_Barrio, Nombre, Id_Municipio
	FROM 
		OPENJSON(@JsonBarrio)
	WITH (
		Id_Barrio INT '$.Id_Barrio', Nombre CHAR(30) '$.Nombre', Id_Municipio INT '$.Id_Municipio'
	)	

	BEGIN TRY
		
		MERGE BARRIOS AS TARGET
		USING #TempBarrios AS SOURCE
		ON TARGET.ID_BARRIO = SOURCE.Id_Barrio AND TARGET.NOMBRE = UPPER(SOURCE.Nombre)
		WHEN MATCHED THEN
		UPDATE SET TARGET.ID_MUNICIPIO = SOURCE.Id_Municipio
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, ID_MUNICIPIO)
			VALUES (UPPER(SOURCE.Nombre), SOURCE.Id_Municipio);

		IF OBJECT_ID('tempdb..#TempBarrios') IS NOT NULL DROP TABLE #TempBarrios

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempBarrios') IS NOT NULL DROP TABLE #TempBarrios

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END