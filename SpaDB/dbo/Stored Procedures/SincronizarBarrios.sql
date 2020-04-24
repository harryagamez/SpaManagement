CREATE PROCEDURE SincronizarBarrios(@Json NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempBarrios(ObjectId VARCHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Codigo VARCHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Nombre VARCHAR(50) COLLATE SQL_Latin1_General_CP1_CI_AS, Tipo INT)

	DECLARE @IdMunicipio INT
	SET @IdMunicipio = (SELECT TOP 1 ID_MUNICIPIO FROM MUNICIPIOS WHERE RTRIM(NOMBRE) = 'MEDELLÍN')

	INSERT INTO #TempBarrios (ObjectId,Codigo,Nombre,Tipo)
	SELECT 
		JSON_VALUE (B.value, '$.ObjectId') AS ObjectId,
		JSON_VALUE (B.value, '$.Codigo') AS Codigo, 
		JSON_VALUE (B.value, '$.Nombre') AS Nombre, 
		JSON_VALUE (B.value, '$.Subtipo_BarrioVereda') AS Tipo
	FROM OPENJSON(@Json) AS B

	MERGE BARRIOS AS T
	USING #TempBarrios AS S
	ON T.ID_MUNICIPIO = @IdMunicipio AND RTRIM(T.NOMBRE) = S.Nombre AND T.CODIGO = S.Codigo
	AND T.ID_OBJECT = S.ObjectId
	WHEN MATCHED THEN
	UPDATE SET T.NOMBRE = S.Nombre, T.CODIGO = S.Codigo
	WHEN NOT MATCHED THEN
	INSERT (NOMBRE, ID_MUNICIPIO, CODIGO, ID_OBJECT)
	VALUES (RTRIM(S.Nombre), @IdMunicipio, RTRIM(S.Codigo), S.ObjectId)
	OUTPUT $action, inserted.*;

	IF OBJECT_ID('tempdb..#TempBarrios') IS NOT NULL DROP TABLE #TempBarrios

END

GO
