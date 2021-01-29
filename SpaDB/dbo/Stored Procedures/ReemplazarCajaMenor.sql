CREATE PROCEDURE [dbo].[ReemplazarCajaMenor](
	@JsonCajaMenor NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Distribucion CHAR(10)
	DECLARE @IdRegistro INT
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @Acumulado REAL
	DECLARE @UsuarioRegistro CHAR(25)
	DECLARE @Valor DECIMAL(18,2)
	DECLARE @FechaActual DATETIME = GETDATE()

	SELECT 
		@Distribucion = Distribucion, 
		@IdRegistro = Id_Registro,
		@Valor = Saldo_Inicial,		
		@UsuarioRegistro = Usuario_Registro,
		@IdEmpresa = Id_Empresa
	FROM 
		OPENJSON(@JsonCajaMenor)
	WITH (
		Distribucion CHAR(10) '$.Distribucion',
		Id_Registro INT '$.Id_Registro',
		Saldo_Inicial DECIMAL(18,2) '$.Saldo_Inicial',
		Usuario_Registro CHAR(25) '$.Usuario_Registro',
		Id_Empresa VARCHAR(36) '$.Id_Empresa'
	)

	SET @Acumulado = (SELECT ACUMULADO FROM CAJA_MENOR WHERE ID_REGISTRO = @IdRegistro AND CAST(ID_EMPRESA AS VARCHAR(36)) = @IdEmpresa)

	BEGIN TRY

		BEGIN TRANSACTION Tn_ReemplazarCajaMenor

			IF @Distribucion = 'DIARIA' BEGIN

				MERGE CAJA_MENOR AS TARGET
				USING(
					SELECT JsonCajaMenor.Saldo_Inicial, JsonCajaMenor.Acumulado, JsonCajaMenor.Distribucion, JsonCajaMenor.Id_Empresa
					FROM OPENJSON(@JsonCajaMenor) 
					WITH (
						Saldo_Inicial DECIMAL(18,2) '$.Saldo_Inicial', Acumulado DECIMAL(18,2) '$.Acumulado', Distribucion CHAR(10) '$.Distribucion', Id_Empresa VARCHAR(36) '$.Id_Empresa'				
					) AS JsonCajaMenor
				) AS SOURCE(Saldo_Inicial, Acumulado, Distribucion, Id_Empresa)		

				ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_REGISTRO = @IdRegistro AND TARGET.ANIO = YEAR(@FechaActual) AND TARGET.MES = MONTH(@FechaActual)
				WHEN MATCHED THEN
					UPDATE 
						SET TARGET.DIA = @FechaActual, TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = @FechaActual, TARGET.USUARIO_MODIFICACION = @UsuarioRegistro;				

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

				ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_REGISTRO = @IdRegistro AND TARGET.ANIO = YEAR(@FechaActual) AND TARGET.MES = MONTH(@FechaActual) AND DAY(TARGET.DIA) = DAY(@FechaActual)
				WHEN MATCHED THEN
					UPDATE 
						SET TARGET.DIA = NULL, TARGET.ACUMULADO = (SOURCE.Acumulado + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (SOURCE.Acumulado + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = @FechaActual, TARGET.USUARIO_MODIFICACION = @UsuarioRegistro;
			
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

		COMMIT TRANSACTION Tn_ReemplazarCajaMenor

	END TRY

	BEGIN CATCH

		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_ReemplazarCajaMenor
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO