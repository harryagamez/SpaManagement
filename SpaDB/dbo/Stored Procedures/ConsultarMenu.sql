﻿CREATE PROCEDURE ConsultarMenu(@IdUsuario INT)
AS
BEGIN

	SELECT 
		ID_MENU, ID_USUARIO, RUTA_ACCESO, DESCRIPCION,
		LOGO_BASE64 
	FROM MENU 
	WHERE ID_USUARIO = @IdUsuario

END

GO