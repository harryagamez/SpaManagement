CREATE PROCEDURE ConfirmarAgenda(
	@IdAgenda INT, 
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN

	DECLARE @Mensaje CHAR(200)

	IF ((SELECT ESTADO FROM AGENDA WHERE ID_AGENDA = @IdAgenda) = 'CANCELADA') BEGIN
		SET @Mensaje = 'Esta cita ya ha sido cancelada y no puede ser confirmada'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	UPDATE AGENDA 
		SET ESTADO = 'CONFIRMADA' 
	WHERE ID_AGENDA = @IdAgenda 
	AND ID_EMPRESA = @IdEmpresa

END

GO