CREATE PROCEDURE GuardarCajaMenor(
	@JsonCajaMenor NVARCHAR(MAX)
)
AS
BEGIN

	DECLARE @Distribucion CHAR(10)

	SELECT 
		@Distribucion = Distribucion
	FROM 
		OPENJSON(@JsonCajaMenor)
	WITH (
		Distribucion CHAR(10) '$.Distribucion' 
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

			ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = CAST(YEAR(GETDATE()) AS INT) AND TARGET.MES = CAST(MONTH(GETDATE()) AS INT) AND CONVERT(date, TARGET.DIA) = CONVERT(date, GETDATE())
			WHEN MATCHED THEN
				UPDATE 
					SET TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = GETDATE()
			WHEN NOT MATCHED THEN
				INSERT (ANIO, MES, DIA, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
				VALUES (YEAR(GETDATE()), MONTH(GETDATE()), CAST(GETDATE() AS SMALLDATETIME), SOURCE.Saldo_Inicial, SOURCE.Saldo_Inicial, GETDATE(), GETDATE(), SOURCE.Id_Empresa);

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

			ON  TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ANIO = CAST(YEAR(GETDATE()) AS INT) AND TARGET.MES = CAST(MONTH(GETDATE()) AS INT)
			WHEN MATCHED THEN
				UPDATE 
					SET TARGET.ACUMULADO = (TARGET.ACUMULADO + SOURCE.Saldo_Inicial), TARGET.SALDO_INICIAL = (TARGET.SALDO_INICIAL + SOURCE.Saldo_Inicial), TARGET.FECHA_MODIFICACION = GETDATE()
			WHEN NOT MATCHED THEN
				INSERT (ANIO, MES, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
				VALUES (YEAR(GETDATE()), MONTH(GETDATE()), SOURCE.Saldo_Inicial, SOURCE.Saldo_Inicial, GETDATE(), GETDATE(), SOURCE.Id_Empresa);

		END

	END TRY
	BEGIN CATCH
		
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO
