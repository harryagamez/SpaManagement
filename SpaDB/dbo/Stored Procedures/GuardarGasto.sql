CREATE PROCEDURE [dbo].[GuardarGasto](
	@JsonGasto NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @TotalGasto DECIMAL(18,2)
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @FechaActual AS DATETIME =  GETDATE()	

	CREATE TABLE #TempGastos(Id_Gasto INT, Tipo_Gasto CHAR(15), Descripcion CHAR(300), Valor DECIMAL(18,2), Fecha SMALLDATETIME, 
	Estado CHAR(12), Id_Empleado INT, Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Id_Empresa VARCHAR(36), Usuario_Registro CHAR(25))	

	INSERT INTO #TempGastos (Id_Gasto, Tipo_Gasto, Descripcion, Valor, Fecha, Estado, Id_Empleado, Id_Empresa, Usuario_Registro)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Gasto') AS Id_Gasto,
		JSON_VALUE (C.value, '$.Tipo_Gasto') AS Tipo_Gasto, 
		JSON_VALUE (C.value, '$.Descripcion') AS Descripcion,
		JSON_VALUE (C.value, '$.Valor') AS Valor,
		JSON_VALUE (C.value, '$.Fecha') AS Fecha,
		JSON_VALUE (C.value, '$.Estado') AS Estado,
		JSON_VALUE (C.value, '$.Id_Empleado') AS Id_Empleado,				
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa,
		JSON_VALUE (C.value, '$.Usuario_Registro') AS Usuario_Registro
	FROM OPENJSON(@JsonGasto) AS C
			
	SELECT 
		@TotalGasto = Valor,
		@IdEmpresa = Id_Empresa
	FROM #TempGastos

	BEGIN TRY

		BEGIN TRANSACTION Tn_GuardarGasto			

			;WITH totalacumulado AS
			(
				SELECT TOP 1 * FROM CAJA_MENOR
				WHERE ID_EMPRESA = @IdEmpresa
				ORDER BY FECHA_REGISTRO DESC
			)
			UPDATE totalacumulado SET ACUMULADO = (ACUMULADO - @TotalGasto)


			INSERT INTO GASTOS (TIPO_GASTO, DESCRIPCION, VALOR, FECHA, ESTADO, ID_EMPLEADO, FECHA_REGISTRO, 
			ID_EMPRESA, USUARIO_REGISTRO)
			SELECT 
				Tipo_Gasto, Descripcion, Valor, Fecha, Estado, 
				Id_Empleado, @FechaActual, Id_Empresa,
				Usuario_Registro
			FROM #TempGastos
			
		COMMIT TRANSACTION Tn_GuardarGasto

		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos

	END TRY

	BEGIN CATCH

		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_GuardarGasto
		IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END


GO