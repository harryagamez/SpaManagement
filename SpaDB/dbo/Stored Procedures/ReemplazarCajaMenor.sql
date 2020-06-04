CREATE PROCEDURE ReemplazarCajaMenor(@JsonCajaMenor NVARCHAR(MAX))
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Distribucion INT
	DECLARE @IdRegistro INT
	DECLARE @SaldoInicial REAL

	

	SELECT @Distribucion = Distribucion, @IdRegistro = Id_Registro
		FROM 
			OPENJSON(@JsonCajaMenor)
		WITH (
			Distribucion INT '$.Distribucion',
			Id_Registro INT '$.Id_Registro'
		)

	SET @SaldoInicial = (SELECT SALDO_INICIAL FROM CAJA_MENOR WHERE ID_REGISTRO = @IdRegistro)


	BEGIN TRY

		BEGIN TRANSACTION Tn_ReemplazarCajaMenor		
			
			DELETE FROM CAJA_MENOR WHERE ID_REGISTRO = @IdRegistro

			IF @Distribucion = 1 BEGIN

				MERGE CAJA_MENOR AS TARGET
					USING(
						SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
						FROM OPENJSON(@JsonCajaMenor) 
						WITH (
							Saldo_Inicial REAL '$.Saldo_Inicial', Acumulado REAL '$.Acumulado', Distribucion INT '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
						) AS JsonCajaMenor
					) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

					ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = CAST(YEAR(GETDATE()) AS INT) AND TARGET.MES = CAST(MONTH(GETDATE()) AS INT) AND CONVERT(date, TARGET.DIA) = CONVERT(date, GETDATE())
					WHEN MATCHED THEN
						UPDATE 
							SET TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = GETDATE()
					WHEN NOT MATCHED THEN
						INSERT (ANIO, MES, DIA, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
						VALUES (YEAR(GETDATE()), MONTH(GETDATE()), CAST(GETDATE() AS SMALLDATETIME), (SOURCE.Saldo_Inicial + @SaldoInicial), (SOURCE.Saldo_Inicial + SOURCE.Acumulado), GETDATE(), GETDATE(), SOURCE.Id_Empresa);
			END

			IF @Distribucion = 2 BEGIN

				MERGE CAJA_MENOR AS TARGET
					USING(
						SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
						FROM OPENJSON(@JsonCajaMenor) 
						WITH (
							Saldo_Inicial REAL '$.Saldo_Inicial', Acumulado REAL '$.Acumulado', Distribucion INT '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
						) AS JsonCajaMenor
					) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

					ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = CAST(YEAR(GETDATE()) AS INT) AND TARGET.MES = CAST(MONTH(GETDATE()) AS INT)
					WHEN MATCHED THEN
						UPDATE 
							SET TARGET.ACUMULADO = (SOURCE.Acumulado + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (SOURCE.Acumulado + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = GETDATE()
					WHEN NOT MATCHED THEN
						INSERT (ANIO, MES, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
						VALUES (YEAR(GETDATE()), MONTH(GETDATE()), (SOURCE.Saldo_Inicial + @SaldoInicial), (SOURCE.Acumulado + SOURCE.Saldo_Inicial), GETDATE(), GETDATE(), SOURCE.Id_Empresa);
			END

		COMMIT TRANSACTION

	END TRY

	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_ReemplazarCajaMenor

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END