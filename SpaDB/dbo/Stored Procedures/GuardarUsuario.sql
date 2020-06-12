CREATE PROCEDURE GuardarUsuarios(@JsonUsuario NVARCHAR(MAX))
AS
BEGIN

	DECLARE @UsuarioId INT
	
	BEGIN TRY
		
		MERGE USUARIOS AS TARGET
		USING(
			SELECT JsonUsuario.Id_Usuario, JsonUsuario.Nombre, JsonUsuario.Contrasenia, JsonUsuario.Perfil, JsonUsuario.Id_Empresa, 
			JsonUsuario.Mail, JsonUsuario.Logo_Base64
			FROM OPENJSON(@JsonUsuario) 
			WITH (
				Id_Usuario INT '$.Id_Usuario', Nombre CHAR(25) '$.Nombre', Contrasenia NVARCHAR(MAX) '$.Contrasenia', Perfil CHAR(15) '$.Perfil',
				Id_Empresa VARCHAR(36) '$.Id_Empresa', Mail CHAR(60) '$.Mail', Logo_Base64 NVARCHAR(MAX) '$.Logo_Base64'
			) AS JsonUsuario
		) AS SOURCE(Id_Usuario, Nombre, Contrasenia, Perfil, Id_Empresa, Mail, Logo_Base64)
		ON TARGET.ID_USUARIO = SOURCE.Id_Usuario AND TARGET.NOMBRE = SOURCE.Nombre AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa	
		WHEN MATCHED THEN
			UPDATE 
				SET TARGET.CONTRASENIA = SOURCE.Contrasenia, TARGET.PERFIL = SOURCE.Perfil, 				 
				TARGET.MAIL = SOURCE.Mail, TARGET.LOGO_BASE64 = SOURCE.Logo_Base64, 
				TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, CONTRASENIA, PERFIL, ID_EMPRESA, MAIL, LOGO_BASE64, VERIFICADO, FECHA_REGISTRO, FECHA_MODIFICACION)
			VALUES (SOURCE.Nombre, SOURCE.Contrasenia, SOURCE.Perfil, SOURCE.Id_Empresa, SOURCE.Mail, SOURCE.Logo_Base64, NULL, GETDATE(), GETDATE());

		SELECT 
			@UsuarioId = Id_Usuario
		FROM 
			OPENJSON(@JsonUsuario)
		WITH (
			Id_Usuario INT '$.Id_Usuario' 
		)

		IF @UsuarioId = -1
			SET @UsuarioId = SCOPE_IDENTITY()	
		
		MERGE MENU_USUARIOS AS TARGET
		USING(
			SELECT JsonMenuUsuario.*
			FROM OPENJSON(@JsonUsuario, '$')
			WITH (
				Id_Usuario INT '$.Id_Usuario',
				Menu_Usuario NVARCHAR(MAX) '$.Menu_Usuario' AS JSON
			) AS JsonUsuario
			CROSS APPLY OPENJSON(JsonUsuario.Menu_Usuario)
			WITH (
				Id_Menu_Usuario VARCHAR(36) '$.Id_Menu_Usuario',
				Id_Usuario INT '$.Id_Usuario',
				Id_Menu INT '$.Id_Menu',
				Estado BIT '$.Estado'				
			) JsonMenuUsuario
		) AS SOURCE(Id_Menu_Usuario, Id_Usuario, Id_Menu, Estado)
		ON TARGET.ID_USUARIO = @UsuarioId AND CAST(TARGET.ID_MENU_USUARIO as varchar(36)) = SOURCE.Id_Menu_Usuario
		WHEN MATCHED THEN
			UPDATE SET TARGET.ESTADO = SOURCE.Estado, TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED AND SOURCE.Id_Usuario = -1 THEN			
			INSERT (ID_MENU_USUARIO, ID_USUARIO, ID_MENU, ESTADO, FECHA_REGISTRO, FECHA_MODIFICACION) 
			VALUES (NEWID(), @UsuarioId, SOURCE.Id_Menu, SOURCE.Estado, GETDATE(), GETDATE());

	END TRY
	BEGIN CATCH

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO

