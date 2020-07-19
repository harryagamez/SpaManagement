CREATE PROCEDURE GuardarEmpresaPropiedades(@JsonPropiedades NVARCHAR(MAX))
AS
BEGIN

	CREATE TABLE #TempPropiedades(Id_Empresa VARCHAR(36), Id_Sistema_Propiedad VARCHAR(36), Valor_Propiedad CHAR(15))
	DECLARE @FechaActual DATETIME

	SET @FechaActual = GETDATE()

	INSERT INTO #TempPropiedades (Id_Empresa, Id_Sistema_Propiedad, Valor_Propiedad)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa,
		JSON_VALUE (C.value, '$.Id_Sistema_Propiedad') AS Id_Sistema_Propiedad, 
		JSON_VALUE (C.value, '$.Valor_Propiedad') AS Valor_Propiedad
	FROM OPENJSON(@JsonPropiedades) AS C

	MERGE EMPRESA_PROPIEDADES AS TARGET
	USING #TempPropiedades AS SOURCE
	ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_SISTEMA_PROPIEDAD = SOURCE.Id_Sistema_Propiedad	
	WHEN MATCHED THEN
		UPDATE SET 
			TARGET.VALOR_PROPIEDAD = SOURCE.Valor_Propiedad,
			TARGET.FECHA_MODIFICACION = @FechaActual
	WHEN NOT MATCHED THEN
		INSERT (ID_EMPRESA_PROPIEDAD, ID_EMPRESA, ID_SISTEMA_PROPIEDAD, VALOR_PROPIEDAD, FECHA_REGISTRO, FECHA_MODIFICACION)
		VALUES (NEWID(), SOURCE.Id_Empresa, SOURCE.Id_Sistema_Propiedad, SOURCE.Valor_Propiedad, @FechaActual, @FechaActual);
		
	IF OBJECT_ID('tempdb..#TempPropiedades') IS NOT NULL DROP TABLE #TempPropiedades

END

GO