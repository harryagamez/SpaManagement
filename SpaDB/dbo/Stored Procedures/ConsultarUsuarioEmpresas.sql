﻿CREATE PROCEDURE [dbo].[ConsultarUsuarioEmpresas](
	@IdUsuario INT
)
AS
BEGIN
	
	DECLARE @IdEmpresa UNIQUEIDENTIFIER = NULL
	DECLARE @Perfil VARCHAR(25)

	SET @Perfil = (SELECT TOP 1 PERFIL FROM USUARIOS WHERE ID_USUARIO = @IdUsuario)
	SET @IdEmpresa = (SELECT TOP 1 ID_EMPRESA FROM USUARIOS WHERE ID_USUARIO = @IdUsuario)

	IF(RTRIM(@Perfil) = 'Administrador') BEGIN
	
		SELECT 
			CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA, RTRIM(NOMBRE) AS NOMBRE, RTRIM(DESCRIPCION) AS DESCRIPCION, 
			RTRIM(DIRECCION) AS DIRECCION, TELEFONO_FIJO, TELEFONO_MOVIL, RTRIM(MAIL) AS MAIL, RTRIM(LOGO) AS LOGO, 
			ISNULL(ID_SEDEPRINCIPAL, '00000000-0000-0000-0000-000000000000') AS ID_SEDEPRINCIPAL, CAST(ID_CATEGORIA_SERVICIO AS VARCHAR(36)) AS ID_CATEGORIA_SERVICIO
		FROM EMPRESA WHERE (ID_EMPRESA = @IdEmpresa OR ID_SEDEPRINCIPAL = @IdEmpresa)
		ORDER BY ID_SEDEPRINCIPAL ASC

	END
	ELSE BEGIN

		SELECT 
			CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA, RTRIM(NOMBRE) AS NOMBRE, RTRIM(DESCRIPCION) AS DESCRIPCION, 
			RTRIM(DIRECCION) AS DIRECCION, TELEFONO_FIJO, TELEFONO_MOVIL, RTRIM(MAIL) AS MAIL, RTRIM(LOGO) AS LOGO, 
			ISNULL(ID_SEDEPRINCIPAL, '00000000-0000-0000-0000-000000000000') AS ID_SEDEPRINCIPAL, CAST(ID_CATEGORIA_SERVICIO AS VARCHAR(36)) AS ID_CATEGORIA_SERVICIO
		FROM EMPRESA WHERE ID_EMPRESA = @IdEmpresa

	END

END

GO