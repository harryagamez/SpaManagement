﻿CREATE PROCEDURE [dbo].[ConsultarMenu](
	@IdUsuario INT, 
	@IdEmpresa VARCHAR(36), 
	@Perfil VARCHAR(25)
)
AS
BEGIN

	IF (@IdEmpresa = '00000000-0000-0000-0000-000000000000' AND RTRIM(@Perfil) = '[MANAGER]') BEGIN

		SELECT 
			ID_MENU, RUTA_ACCESO, 
			DESCRIPCION, _PARENTID, _LEVEL, _CHILDREN, LOGO_BASE64
		FROM MENU 
		ORDER BY DESCRIPCION ASC
		
	END
	ELSE BEGIN
		
		SELECT 
			MENU_USUARIOS.ID_MENU, MENU_USUARIOS.ID_USUARIO, 
			RUTA_ACCESO, DESCRIPCION, _PARENTID, _LEVEL, _CHILDREN, LOGO_BASE64 
		FROM MENU 
		INNER JOIN MENU_USUARIOS
		ON MENU.ID_MENU = MENU_USUARIOS.ID_MENU OR MENU_USUARIOS.ID_MENU = _PARENTID
		WHERE MENU_USUARIOS.ID_USUARIO = @IdUsuario AND ESTADO = 1
		ORDER BY DESCRIPCION ASC

	END

END

GO