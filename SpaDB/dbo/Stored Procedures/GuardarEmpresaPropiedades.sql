CREATE PROCEDURE GuardarEmpresaPropiedades(
	@JsonPropiedades NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @FechaActual DATETIME
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @ValorPropiedad CHAR(15)
	DECLARE @OldIdTipoPago VARCHAR(36)
	DECLARE @NewIdTipoPago VARCHAR(36)

	CREATE TABLE #TempPropiedades(Id_Empresa VARCHAR(36), Id_Sistema_Propiedad VARCHAR(36), Valor_Propiedad CHAR(15))	

	SET @FechaActual = GETDATE()

	INSERT INTO #TempPropiedades (Id_Empresa, Id_Sistema_Propiedad, Valor_Propiedad)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa,
		JSON_VALUE (C.value, '$.Id_Sistema_Propiedad') AS Id_Sistema_Propiedad, 
		JSON_VALUE (C.value, '$.Valor_Propiedad') AS Valor_Propiedad
	FROM OPENJSON(@JsonPropiedades) AS C

	SET @IdEmpresa = (SELECT TOP 1 Id_Empresa FROM #TempPropiedades)
	SET @ValorPropiedad = (SELECT TOP 1 Valor_Propiedad FROM #TempPropiedades
	WHERE Valor_Propiedad = 'MENSUAL' OR Valor_Propiedad = 'QUINCENAL' OR Valor_Propiedad = 'DIARIO' OR Valor_Propiedad = 'POR_SERVICIOS')

	SET @OldIdTipoPago = (SELECT TOP 1 CAST(ID_TIPOPAGO AS VARCHAR(36)) FROM EMPLEADOS WHERE ID_EMPRESA = @IdEmpresa)
	SET @NewIdTipoPago = (SELECT TOP 1 CAST(ID_TIPOPAGO AS VARCHAR(36)) FROM TIPO_PAGO WHERE DESCRIPCION = @ValorPropiedad)

	BEGIN TRY

		BEGIN TRANSACTION Tn_GuardarEmpresaPropiedades	
	
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

		IF(@OldIdTipoPago <> @NewIdTipoPago) BEGIN
			UPDATE EMPLEADOS SET ID_TIPOPAGO = @NewIdTipoPago
			WHERE ID_EMPRESA = @IdEmpresa
		END
	
		COMMIT TRANSACTION Tn_GuardarEmpresaPropiedades	

		IF OBJECT_ID('tempdb..#TempPropiedades') IS NOT NULL DROP TABLE #TempPropiedades

	END TRY

	BEGIN CATCH	
	
		IF OBJECT_ID('tempdb..#TempPropiedades') IS NOT NULL DROP TABLE #TempPropiedades		
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_GuardarEmpresaPropiedades
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)	
		
	END CATCH

END

GO