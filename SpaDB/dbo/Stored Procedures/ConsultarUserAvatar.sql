CREATE PROCEDURE ConsultarUserAvatar(@UserId CHAR(25))
AS
BEGIN
	
	SELECT 
		RTRIM(LOGO_BASE64) as LOGO_BASE64
	FROM USUARIOS 
	WHERE NOMBRE = @UserId

END

GO