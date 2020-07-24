CREATE PROCEDURE GuardarServicio(
	@JsonServicio NVARCHAR(MAX)
)
AS
BEGIN

	DECLARE @ServicioId INT
	
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
			VALUES (UPPER(SOURCE.Nombre), SOURCE.Descripcion, SOURCE.Tiempo, SOURCE.Valor, SOURCE.Id_TipoServicio, SOURCE.Estado, GETDATE(), GETDATE(),
					SOURCE.Id_Empresa, SOURCE.Logo_Base64);

		SELECT 
			@ServicioId = Id_Servicio
		FROM 
			OPENJSON(@JsonServicio)
		WITH (
			Id_Servicio INT '$.Id_Servicio' 
		)

		IF @ServicioId = -1
			SET @ServicioId = SCOPE_IDENTITY()	
		
		MERGE SERVICIO_IMAGENES AS TARGET
		USING(
			SELECT JsonServicioImagenes.*
			FROM OPENJSON(@JsonServicio, '$')
			WITH (
				Id_Servicio INT '$.Id_Servicio',
				Imagenes_Servicio NVARCHAR(MAX) '$.Imagenes_Servicio' AS JSON
			) AS JsonServicio
			CROSS APPLY OPENJSON(JsonServicio.Imagenes_Servicio)
			WITH (
				Id_Servicio_Imagen VARCHAR(36) '$.Id_Servicio_Imagen',
				Id_Servicio INT '$.Id_Servicio',
				Imagen_Base64 NVARCHAR(MAX) '$.Imagen_Base64',
				TuvoCambios BIT '$.TuvoCambios'
			) JsonServicioImagenes
		) AS SOURCE(Id_Servicio_Imagen, Id_Servicio, Imagen_Base64, TuvoCambios)
		ON TARGET.ID_SERVICIO = @ServicioId AND CAST(TARGET.ID_SERVICIO_IMAGEN as varchar(36)) = SOURCE.Id_Servicio_Imagen AND SOURCE.TuvoCambios = 'true'
		WHEN MATCHED THEN
			UPDATE SET TARGET.IMAGEN_BASE64 = SOURCE.Imagen_Base64, TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED AND SOURCE.Id_Servicio = -1 THEN			
			INSERT (ID_SERVICIO_IMAGEN, ID_SERVICIO, IMAGEN_BASE64, FECHA_REGISTRO, FECHA_MODIFICACION) 
			VALUES (NEWID(), @ServicioId, SOURCE.Imagen_Base64, GETDATE(), GETDATE());

	END TRY
	BEGIN CATCH

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO

