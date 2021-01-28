CREATE PROCEDURE EliminarGastos(
	@JsonGastos NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Gasto REAL = 0
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @ValorAcumulado DECIMAL(18,2)
	DECLARE @UsuarioSistema CHAR(25)
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @IdCajaMenor INT
	
	CREATE TABLE #TempGastos(Id_Gasto INT, Valor REAL, Id_Empresa VARCHAR(36), Usuario_Registro CHAR(25))	

	INSERT INTO #TempGastos (Id_Gasto, Valor, Id_Empresa, Usuario_Registro)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Gasto') AS Id_Gasto,				
		JSON_VALUE (C.value, '$.Valor') AS Valor,								
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa,
		JSON_VALUE (C.value, '$.Usuario_Registro') AS Usuario_Registro
	FROM OPENJSON(@JsonGastos) AS C

	SELECT 
		@Gasto =  SUM(VALOR),
		@IdEmpresa = Id_Empresa,
		@UsuarioSistema = Usuario_Registro
	FROM #TempGastos
	GROUP BY Id_Empresa, Usuario_Registro
			
	BEGIN TRY

		BEGIN TRANSACTION Tn_EliminarGastos		
			
			;WITH totalacumulado AS
			(
				SELECT TOP 1 * FROM CAJA_MENOR
				WHERE ID_EMPRESA = @IdEmpresa
				ORDER BY FECHA_REGISTRO DESC
			)
			UPDATE totalacumulado SET ACUMULADO = (ACUMULADO + @Gasto), @ValorAcumulado = (ACUMULADO + @Gasto), 
			FECHA_MODIFICACION = @FechaActual, USUARIO_MODIFICACION = @UsuarioSistema, @IdCajaMenor = ID_REGISTRO

			DELETE EMPRESA_GASTOS 
				FROM GASTOS AS EMPRESA_GASTOS 
			INNER JOIN #TempGastos 
			ON EMPRESA_GASTOS.ID_GASTO = #TempGastos.Id_Gasto
			WHERE EMPRESA_GASTOS.ID_EMPRESA = @IdEmpresa

			IF(SELECT TOP 1 CONVERT(char(10), FECHA_REGISTRO,126) FROM ACUMULADOS_CAJA 
			WHERE ID_EMPRESA = @IdEmpresa ORDER BY FECHA_REGISTRO DESC) = CONVERT(char(10), @FechaActual,126) BEGIN							
						;WITH totalacumulado AS
						(
							SELECT TOP 1 * FROM ACUMULADOS_CAJA
							WHERE ID_EMPRESA = @IdEmpresa
							ORDER BY FECHA_REGISTRO DESC
						)
						UPDATE totalacumulado SET VALOR = @ValorAcumulado, USUARIO_MODIFICACION = @UsuarioSistema, FECHA_MODIFICACION = @FechaActual
				
			END
			ELSE BEGIN				
				INSERT INTO ACUMULADOS_CAJA (ID_REGISTRO, ID_CAJA_MENOR, VALOR, FECHA_REGISTRO, USUARIO_REGISTRO, ID_EMPRESA )
				VALUES (NEWID(), @IdCajaMenor, @ValorAcumulado, @FechaActual, @UsuarioSistema, @IdEmpresa)
			END
			
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


