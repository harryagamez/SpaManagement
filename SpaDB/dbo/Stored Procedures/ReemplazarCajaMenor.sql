CREATE PROCEDURE ReemplazarCajaMenor(
	@JsonCajaMenor NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Distribucion CHAR(10)
	DECLARE @IdRegistro INT
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @Acumulado REAL
	DECLARE @FechaActual DATETIME = GETDATE()

	SELECT 
		@Distribucion = Distribucion, 
		@IdRegistro = Id_Registro,
		@IdEmpresa = Id_Empresa
	FROM 
		OPENJSON(@JsonCajaMenor)
	WITH (
		Distribucion CHAR(10) '$.Distribucion',
		Id_Registro INT '$.Id_Registro',
		Id_Empresa VARCHAR(36) '$.Id_Empresa'
	)

	SET @Acumulado = (SELECT ACUMULADO FROM CAJA_MENOR WHERE ID_REGISTRO = @IdRegistro AND CAST(ID_EMPRESA AS VARCHAR(36)) = @IdEmpresa)

	BEGIN TRY

		BEGIN TRANSACTION Tn_ReemplazarCajaMenor		
			
			DELETE FROM CAJA_MENOR WHERE ID_REGISTRO = @IdRegistro

			IF @Distribucion = 'DIARIA' BEGIN

				MERGE CAJA_MENOR AS TARGET
				USING(
					SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
					FROM OPENJSON(@JsonCajaMenor) 
					WITH (
						Saldo_Inicial REAL '$.Saldo_Inicial', Acumulado REAL '$.Acumulado', Distribucion CHAR(10) '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
					) AS JsonCajaMenor
				) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

				ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = YEAR(@FechaActual) AND TARGET.MES = MONTH(@FechaActual) AND DAY(TARGET.DIA) = DAY(@FechaActual)
				WHEN MATCHED THEN
					UPDATE 
						SET TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = @FechaActual
				WHEN NOT MATCHED THEN
					INSERT (ANIO, MES, DIA, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
					VALUES (YEAR(@FechaActual), MONTH(@FechaActual), CAST(@FechaActual AS SMALLDATETIME), (SOURCE.Saldo_Inicial + @Acumulado), (SOURCE.Saldo_Inicial + SOURCE.Acumulado), @FechaActual, @FechaActual, SOURCE.Id_Empresa);

			END

			IF @Distribucion = 'MENSUAL' BEGIN

				MERGE CAJA_MENOR AS TARGET
				USING(
					SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
					FROM OPENJSON(@JsonCajaMenor) 
					WITH (
						Saldo_Inicial REAL '$.Saldo_Inicial', Acumulado REAL '$.Acumulado', Distribucion CHAR(10) '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
					) AS JsonCajaMenor
				) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

				ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = YEAR(@FechaActual) AND TARGET.MES = MONTH(@FechaActual)
				WHEN MATCHED THEN
					UPDATE 
						SET TARGET.ACUMULADO = (SOURCE.Acumulado + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (SOURCE.Acumulado + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = @FechaActual
				WHEN NOT MATCHED THEN
					INSERT (ANIO, MES, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
					VALUES (YEAR(@FechaActual), MONTH(@FechaActual), (SOURCE.Saldo_Inicial + @Acumulado), (SOURCE.Acumulado + SOURCE.Saldo_Inicial), @FechaActual, @FechaActual, SOURCE.Id_Empresa);

			END

		COMMIT TRANSACTION Tn_ReemplazarCajaMenor

	END TRY

	BEGIN CATCH

		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_ReemplazarCajaMenor
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO