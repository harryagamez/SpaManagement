CREATE PROCEDURE EliminarGastos(@JsonGastos NVARCHAR(MAX))
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Gasto REAL = 0
	DECLARE @IdEmpresa VARCHAR(36)				
	CREATE TABLE #TempGastos(Id_Gasto INT, Valor REAL, Id_Empresa VARCHAR(36))	
	INSERT INTO #TempGastos (Id_Gasto, Valor, Id_Empresa)
			SELECT 
				JSON_VALUE (C.value, '$.Id_Gasto') AS Id_Gasto,				
				JSON_VALUE (C.value, '$.Valor') AS Valor,								
				JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa
			FROM OPENJSON(@JsonGastos) AS C

	SELECT @Gasto =  SUM(VALOR)
	FROM #TempGastos

	SELECT TOP 1 @IdEmpresa = Id_Empresa
	FROM #TempGastos
			

	BEGIN TRY

		BEGIN TRANSACTION Tn_EliminarGastos
			
			UPDATE CAJA_MENOR SET ACUMULADO = (ACUMULADO + @Gasto) WHERE ID_EMPRESA = @IdEmpresa

			DELETE FROM GASTOS SELECT Id_Gasto FROM #TempGastos
			
		COMMIT TRANSACTION

	END TRY

	BEGIN CATCH
		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_EliminarGastos
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END