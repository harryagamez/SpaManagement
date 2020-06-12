CREATE PROCEDURE GuardarGasto(@JsonGasto NVARCHAR(MAX))
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Gasto REAL
	DECLARE @IdEmpresa VARCHAR(36)
	CREATE TABLE #TempGastos(Id_Gasto INT, Tipo_Gasto CHAR(15), Descripcion CHAR(300), Valor REAL, Fecha SMALLDATETIME, Estado CHAR(12), Id_Empleado INT, Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Id_Empresa VARCHAR(36))	

	INSERT INTO #TempGastos (Id_Gasto, Tipo_Gasto, Descripcion, Valor, Fecha, Estado, Id_Empleado, Id_Empresa)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Gasto') AS Id_Gasto,
		JSON_VALUE (C.value, '$.Tipo_Gasto') AS Tipo_Gasto, 
		JSON_VALUE (C.value, '$.Descripcion') AS Descripcion,
		JSON_VALUE (C.value, '$.Valor') AS Valor,
		JSON_VALUE (C.value, '$.Fecha') AS Fecha,
		JSON_VALUE (C.value, '$.Estado') AS Estado,
		JSON_VALUE (C.value, '$.Id_Empleado') AS Id_Empleado,				
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa
	FROM OPENJSON(@JsonGasto) AS C
			
	SELECT 
		@Gasto = Valor,
		@IdEmpresa = Id_Empresa
	FROM #TempGastos

	BEGIN TRY

		BEGIN TRANSACTION Tn_GuardarGasto		
			
			UPDATE CAJA_MENOR SET ACUMULADO = (ACUMULADO - @Gasto) WHERE ID_EMPRESA = @IdEmpresa

			INSERT INTO GASTOS (TIPO_GASTO, DESCRIPCION, VALOR, FECHA, ESTADO, ID_EMPLEADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
			SELECT 
				Tipo_Gasto, Descripcion, Valor, Fecha, Estado, 
				Id_Empleado, GETDATE(), GETDATE(), Id_Empresa
			FROM #TempGastos
			
		COMMIT TRANSACTION Tn_GuardarGasto

		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_GuardarGasto
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO