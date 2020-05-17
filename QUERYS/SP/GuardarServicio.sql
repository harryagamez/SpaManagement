ALTER PROCEDURE GuardarServicio(@JsonServicio NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempServicio(Id_Servicio INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS , Descripcion CHAR(300) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Tiempo INT, Valor REAL, Id_TipoServicio INT, Estado CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS,
	Logo_Base64 NVARCHAR(MAX))

	INSERT INTO #TempServicio (Id_Servicio, Nombre, Descripcion, Tiempo, Valor, Id_TipoServicio, Estado, Id_Empresa, Logo_Base64)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Servicio') AS Id_Servicio,
		JSON_VALUE (C.value, '$.Nombre') AS Nombre, 
		JSON_VALUE (C.value, '$.Descripcion') AS Descripcion, 
		JSON_VALUE (C.value, '$.Tiempo') AS Tiempo,
		JSON_VALUE (C.value, '$.Valor') AS Valor,
		JSON_VALUE (C.value, '$.Id_TipoServicio') AS Id_TipoServicio,				
		JSON_VALUE (C.value, '$.Estado') AS Estado,
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa,
		JSON_VALUE (C.value, '$.Logo_Base64') AS Logo_Base64
	FROM OPENJSON(@JsonServicio) AS C

	SELECT * FROM #TempServicio
	RETURN

	BEGIN TRY
		
		MERGE SERVICIOS AS TARGET
		USING #TempServicio AS SOURCE
		ON TARGET.ID_SERVICIO = SOURCE.Id_Servicio AND TARGET.NOMBRE = SOURCE.Nombre AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa		
		WHEN MATCHED THEN
			UPDATE SET TARGET.NOMBRE = SOURCE.Nombre, TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.TIEMPO = SOURCE.Tiempo,
			TARGET.VALOR = SOURCE.Valor, TARGET.ID_TIPOSERVICIO = SOURCE.Id_TipoServicio, TARGET.ESTADO = SOURCE.Estado,
		    TARGET.LOGO_BASE64 = SOURCE.Logo_Base64, TARGET.FECHA_REGISTRO = GETDATE(), TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, DESCRIPCION, TIEMPO, VALOR, ID_TIPOSERVICIO, ESTADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA, LOGO_BASE64)
			VALUES (SOURCE.Nombre, SOURCE.Descripcion, SOURCE.Tiempo, SOURCE.Valor, SOURCE.Id_TipoServicio, SOURCE.Estado, GETDATE(), GETDATE(),
			SOURCE.Id_Empresa, SOURCE.Logo_Base64);		

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempServicio') IS NOT NULL DROP TABLE #TempServicio
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO