CREATE PROCEDURE GuardarCajaMenor(
	@JsonCajaMenor NVARCHAR(MAX)
)
AS
BEGIN

	DECLARE @Distribucion CHAR(10)
	DECLARE @IdRegistro INT
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @UsuarioRegistro CHAR(25)
	DECLARE @Valor DECIMAL(18,2)
	DECLARE @FechaActual DATETIME = GETDATE()	

	SELECT
		@IdRegistro = Id_Registro,
		@Distribucion = Distribucion,
		@Valor = Saldo_Inicial,
		@IdEmpresa = Id_Empresa,
		@UsuarioRegistro = Usuario_Registro
	FROM 
		OPENJSON(@JsonCajaMenor)
	WITH (
		Id_Registro INT '$.Id_Registro',
		Distribucion CHAR(10) '$.Distribucion',
		Saldo_Inicial DECIMAL(18,2) '$.Saldo_Inicial',
		Id_Empresa VARCHAR(36) '$.Id_Empresa',
		Usuario_Registro CHAR(25) '$.Usuario_Registro'
	)	
	
	BEGIN TRY

		IF @Distribucion = 'DIARIA' BEGIN			

			MERGE CAJA_MENOR AS TARGET
			USING(
				SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
				FROM OPENJSON(@JsonCajaMenor) 
				WITH (
					Saldo_Inicial DECIMAL(18,2) '$.Saldo_Inicial', Acumulado DECIMAL(18,2) '$.Acumulado', Distribucion CHAR(10) '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
				) AS JsonCajaMenor
			) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

			ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = CAST(YEAR(@FechaActual) AS INT) AND TARGET.MES = CAST(MONTH(@FechaActual) AS INT) AND CONVERT(date, TARGET.DIA) = CONVERT(date, @FechaActual)
			WHEN MATCHED THEN
				UPDATE 
					SET TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = @FechaActual, TARGET.USUARIO_MODIFICACION = @UsuarioRegistro
			WHEN NOT MATCHED THEN
				INSERT (ANIO, MES, DIA, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, USUARIO_REGISTRO, ID_EMPRESA)
				VALUES (YEAR(@FechaActual), MONTH(@FechaActual), CAST(@FechaActual AS SMALLDATETIME), SOURCE.Saldo_Inicial, SOURCE.Saldo_Inicial, @FechaActual, @UsuarioRegistro, SOURCE.Id_Empresa);

			IF (@IdRegistro = -1) BEGIN

				SET @IdRegistro = SCOPE_IDENTITY()
				INSERT INTO ACUMULADOS_CAJA (ID_REGISTRO, ID_CAJA_MENOR, VALOR, FECHA_REGISTRO, USUARIO_REGISTRO, FECHA_MODIFICACION, USUARIO_MODIFICACION, ID_EMPRESA)
				VALUES (NEWID(), @IdRegistro, @Valor, @FechaActual, @UsuarioRegistro, null, null, @IdEmpresa)

			END
			ELSE BEGIN

				;WITH acumulado AS
				(
					SELECT TOP 1 * FROM ACUMULADOS_CAJA
					WHERE ID_EMPRESA = @IdEmpresa AND ID_CAJA_MENOR = @IdRegistro
					ORDER BY FECHA_REGISTRO DESC
				)
				UPDATE acumulado SET VALOR = acumulado.VALOR + @Valor, USUARIO_MODIFICACION = @UsuarioRegistro, FECHA_MODIFICACION = @FechaActual

			END

		END

		IF @Distribucion = 'MENSUAL' BEGIN

			MERGE CAJA_MENOR AS TARGET
			USING(
				SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
				FROM OPENJSON(@JsonCajaMenor) 
				WITH (
					Saldo_Inicial DECIMAL(18,2) '$.Saldo_Inicial', Acumulado DECIMAL(18,2) '$.Acumulado', Distribucion CHAR(10) '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
				) AS JsonCajaMenor
			) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

			ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = CAST(YEAR(@FechaActual) AS INT) AND TARGET.MES = CAST(MONTH(@FechaActual) AS INT) AND TARGET.DIA IS NULL
			WHEN MATCHED THEN
				UPDATE 
					SET TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = @FechaActual, TARGET.USUARIO_MODIFICACION = @UsuarioRegistro
			WHEN NOT MATCHED THEN
				INSERT (ANIO, MES, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, USUARIO_REGISTRO, ID_EMPRESA)
				VALUES (YEAR(@FechaActual), MONTH(@FechaActual), SOURCE.Saldo_Inicial, SOURCE.Saldo_Inicial, @FechaActual, @UsuarioRegistro, SOURCE.Id_Empresa);
			
			
			IF (@IdRegistro = -1) BEGIN

				SET @IdRegistro = SCOPE_IDENTITY()
				INSERT INTO ACUMULADOS_CAJA (ID_REGISTRO, ID_CAJA_MENOR, VALOR, FECHA_REGISTRO, USUARIO_REGISTRO, FECHA_MODIFICACION, USUARIO_MODIFICACION, ID_EMPRESA)
				VALUES (NEWID(), @IdRegistro, @Valor, @FechaActual, @UsuarioRegistro, null, null, @IdEmpresa)

			END
			ELSE BEGIN

				;WITH acumulado AS
				(
					SELECT TOP 1 * FROM ACUMULADOS_CAJA
					WHERE ID_EMPRESA = @IdEmpresa AND ID_CAJA_MENOR = @IdRegistro
					ORDER BY FECHA_REGISTRO DESC
				)
				UPDATE acumulado SET VALOR = acumulado.VALOR + @Valor, USUARIO_MODIFICACION = @UsuarioRegistro, FECHA_MODIFICACION = @FechaActual

			END

		END	

	END TRY	

	BEGIN CATCH
		
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END
GO
