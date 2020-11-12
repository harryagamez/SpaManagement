CREATE PROCEDURE GuardarServicio(
	@JsonServicio NVARCHAR(MAX)
)
AS
BEGIN

	DECLARE @ServicioId VARCHAR(36)
	
	SELECT 
		@ServicioId = Id_Empresa_Servicio
	FROM 
		OPENJSON(@JsonServicio)
	WITH (
		Id_Empresa_Servicio VARCHAR(36) '$.Id_Empresa_Servicio' 
	)

	IF @ServicioId = '00000000-0000-0000-0000-000000000000'
		SET @ServicioId = NEWID()
	
	BEGIN TRY
		
		MERGE EMPRESA_SERVICIOS AS TARGET
		USING(
			SELECT JsonServicio.Id_Empresa_Servicio, JsonServicio.Id_Servicio, JsonServicio.Tiempo, JsonServicio.Valor, JsonServicio.Estado, JsonServicio.Id_Empresa, JsonServicio.Logo_Base64 
			FROM OPENJSON(@JsonServicio) 
			WITH (
				Id_Empresa_Servicio VARCHAR(36) '$.Id_Empresa_Servicio', Id_Servicio INT '$.Id_Servicio', Tiempo INT '$.Tiempo', Valor REAL '$.Valor', Estado CHAR(10) '$.Estado', 
				Id_Empresa VARCHAR(36) '$.Id_Empresa', Logo_Base64 NVARCHAR(MAX) '$.Logo_Base64'
			) AS JsonServicio
		) AS SOURCE(Id_Empresa_Servicio, Id_Servicio, Tiempo, Valor, Estado, Id_Empresa, Logo_Base64)
		ON TARGET.ID_EMPRESA_SERVICIO = SOURCE.Id_Empresa_Servicio AND TARGET.ID_SERVICIO = SOURCE.Id_Servicio AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa	
		WHEN MATCHED THEN
			UPDATE 
				SET TARGET.TIEMPO = SOURCE.Tiempo,TARGET.VALOR = SOURCE.Valor,				 
				TARGET.ESTADO = SOURCE.Estado, TARGET.LOGO_BASE64 = SOURCE.Logo_Base64, 
				TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (ID_EMPRESA_SERVICIO, ID_SERVICIO, TIEMPO, VALOR, ESTADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA, LOGO_BASE64)
			VALUES (@ServicioId, SOURCE.Id_Servicio, SOURCE.Tiempo, SOURCE.Valor, SOURCE.Estado, GETDATE(), GETDATE(), SOURCE.Id_Empresa, SOURCE.Logo_Base64);		

	END TRY

	BEGIN CATCH

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO

