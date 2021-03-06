﻿CREATE PROCEDURE [dbo].[ActualizarCodigoIntegracion](
	@IdUsuario INT, 
	@IdEmpresa VARCHAR(36), 
	@CodigoIntegracion VARCHAR(36)
)
AS
BEGIN

	UPDATE USUARIOS 
		SET CODIGO_INTEGRACION = @CodigoIntegracion 
	WHERE ID_USUARIO = @IdUsuario 
	AND ID_EMPRESA = @IdEmpresa
	AND CODIGO_INTEGRACION IS NULL

END

GO

