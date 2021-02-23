CREATE PROCEDURE [dbo].[ConfirmarAgenda](
	@IdAgenda INT, 
	@IdEmpresa VARCHAR(36),
	@UsuarioSistema CHAR(25)
)
AS
BEGIN

	DECLARE @Mensaje CHAR(200)
	DECLARE @FechaActual DATETIME = GETDATE()

	IF ((SELECT TOP 1 ESTADO FROM AGENDA WHERE ID_EMPRESA = @IdEmpresa AND ID_AGENDA = @IdAgenda) = 'CANCELADA') BEGIN
		SET @Mensaje = 'Esta cita ya ha sido cancelada y no puede ser confirmada'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	UPDATE AGENDA 
		SET ESTADO = 'CONFIRMADA',
			USUARIO_MODIFICACION = @UsuarioSistema,
			FECHA_MODIFICACION = @FechaActual
	WHERE ID_AGENDA = @IdAgenda 
	AND ID_EMPRESA = @IdEmpresa

END

GO