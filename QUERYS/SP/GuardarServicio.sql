ALTER PROCEDURE GuardarServicio(@JsonServicio NVARCHAR(MAX))
AS
BEGIN
	
	BEGIN TRY
		
		MERGE SERVICIOS AS TARGET
		USING(
			SELECT JsonServicio.Id_Servicio, JsonServicio.Nombre, JsonServicio.Descripcion, JsonServicio.Tiempo, JsonServicio.Valor, 
			JsonServicio.Id_TipoServicio, JsonServicio.Estado, JsonServicio.Id_Empresa, JsonServicio.Logo_Base64 
			FROM OPENJSON(@JsonServicio) 
			WITH (
				Id_Servicio INT '$.Id_Servicio', Nombre CHAR(30) '$.Nombre', Descripcion CHAR(300) '$.Descripcion', Tiempo INT '$.Tiempo',
				Valor REAL '$.Valor', Id_TipoServicio INT '$.Id_TipoServicio', Estado CHAR(10) '$.Estado', Id_Empresa VARCHAR(36) '$.Id_Empresa',
				Logo_Base64 NVARCHAR(MAX) '$.Logo_Base64'
			) AS JsonServicio
		) AS SOURCE(Id_Servicio, Nombre, Descripcion, Tiempo, Valor, Id_TipoServicio, Estado, Id_Empresa, Logo_Base64)
		ON TARGET.ID_SERVICIO = SOURCE.Id_Servicio AND TARGET.NOMBRE = SOURCE.Nombre AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa	
		WHEN MATCHED THEN
			UPDATE 
				SET TARGET.NOMBRE = SOURCE.Nombre, TARGET.DESCRIPCION = SOURCE.Descripcion, 
				TARGET.TIEMPO = SOURCE.Tiempo,TARGET.VALOR = SOURCE.Valor, 
				TARGET.ID_TIPOSERVICIO = SOURCE.Id_TipoServicio, 
				TARGET.ESTADO = SOURCE.Estado, TARGET.LOGO_BASE64 = SOURCE.Logo_Base64, 
				TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, DESCRIPCION, TIEMPO, VALOR, ID_TIPOSERVICIO, ESTADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA, LOGO_BASE64)
			VALUES (SOURCE.Nombre, SOURCE.Descripcion, SOURCE.Tiempo, SOURCE.Valor, SOURCE.Id_TipoServicio, SOURCE.Estado, GETDATE(), GETDATE(),
					SOURCE.Id_Empresa, SOURCE.Logo_Base64);		


	END TRY
	BEGIN CATCH

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO

