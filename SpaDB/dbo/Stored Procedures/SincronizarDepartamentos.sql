CREATE PROCEDURE SincronizarDepartamentos(
	@Json NVARCHAR(MAX)
)
AS
BEGIN
	
	CREATE TABLE #TempDepartamentos(Region VARCHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, CodigoDepartamento INT, 
	Departamento VARCHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, CodigoMunicipio INT, Municipio VARCHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS)

	CREATE TABLE #Departamentos (Id_Departamento UNIQUEIDENTIFIER DEFAULT(NULL), CodigoDepartamento INT, Departamento VARCHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS)
	CREATE TABLE #Municipios (CodigoMunicipio INT, Municipio VARCHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, CodigoDepartamento INT, Id_Departamento UNIQUEIDENTIFIER DEFAULT(NULL))

	INSERT INTO #TempDepartamentos (Region, CodigoDepartamento, Departamento, CodigoMunicipio, Municipio)
	SELECT 
		JSON_VALUE (D.value, '$.Region') AS Region,
		JSON_VALUE (D.value, '$.CodigoDepartamento') AS CodigoDepartamento, 
		JSON_VALUE (D.value, '$.Departamento') AS Departamento, 
		JSON_VALUE (D.value, '$.CodigoMunicipio') AS CodigoMunicipio,
		JSON_VALUE (D.value, '$.Municipio') AS Municipio
	FROM OPENJSON(@Json) AS D

	INSERT INTO #Departamentos(CodigoDepartamento, Departamento)
	SELECT 
		DISTINCT CodigoDepartamento, 
		UPPER(Departamento) Departamento
	FROM #TempDepartamentos

	UPDATE #Departamentos SET Id_Departamento = NEWID()

	INSERT INTO #Municipios(CodigoMunicipio, Municipio, CodigoDepartamento)
	SELECT 
		CodigoMunicipio, 
		UPPER(Municipio) Municipio,
		CodigoDepartamento
	FROM #TempDepartamentos

	UPDATE Municipios 
		SET Id_Departamento = Departamentos.Id_Departamento 
	FROM #Municipios Municipios
	INNER JOIN #Departamentos Departamentos 
	ON Departamentos.CodigoDepartamento = Municipios.CodigoDepartamento

	MERGE DEPARTAMENTOS AS T
	USING #Departamentos AS S
		ON UPPER(RTRIM(T.NOMBRE)) = UPPER(RTRIM(S.Departamento)) 
	WHEN MATCHED THEN
		UPDATE SET T.NOMBRE = UPPER(RTRIM(S.Departamento))
	WHEN NOT MATCHED THEN
		INSERT (ID_DEPARTAMENTO, NOMBRE)
		VALUES (S.Id_Departamento, RTRIM(S.Departamento))
	OUTPUT $action, inserted.*;

	MERGE MUNICIPIOS AS T
	USING #Municipios AS S
		ON UPPER(RTRIM(T.NOMBRE)) = UPPER(RTRIM(S.Municipio)) 
	WHEN MATCHED THEN
		UPDATE SET T.NOMBRE = UPPER(RTRIM(S.Municipio))
	WHEN NOT MATCHED THEN
		INSERT (NOMBRE, ID_DEPARTAMENTO)
		VALUES (RTRIM(S.Municipio), S.Id_Departamento)
	OUTPUT $action, inserted.*;

	IF OBJECT_ID('tempdb..#TempDepartamentos') IS NOT NULL DROP TABLE #TempDepartamentos
	IF OBJECT_ID('tempdb..#Departamentos') IS NOT NULL DROP TABLE #Departamentos
	IF OBJECT_ID('tempdb..#Municipios') IS NOT NULL DROP TABLE #Municipios

END

GO
