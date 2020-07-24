CREATE PROCEDURE EliminarGastos(
	@JsonGastos NVARCHAR(MAX)
)
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

	SELECT 
		@Gasto =  SUM(VALOR),
		@IdEmpresa = Id_Empresa
	FROM #TempGastos
	GROUP BY Id_Empresa
			
	BEGIN TRY

		BEGIN TRANSACTION Tn_EliminarGastos
			
			UPDATE CAJA_MENOR SET ACUMULADO = (ACUMULADO + @Gasto) WHERE ID_EMPRESA = @IdEmpresa

			DELETE EMPRESA_GASTOS 
				FROM GASTOS AS EMPRESA_GASTOS 
			INNER JOIN #TempGastos 
			ON EMPRESA_GASTOS.ID_GASTO = #TempGastos.Id_Gasto
			WHERE EMPRESA_GASTOS.ID_EMPRESA = @IdEmpresa
			
		COMMIT TRANSACTION Tn_EliminarGastos

		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos

	END TRY
	BEGIN CATCH

		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_EliminarGastos
		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO


