CREATE PROCEDURE CancelarAgenda(
	@IdAgenda INT, 
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN
	
	DECLARE @Mensaje CHAR(200)

	IF ((SELECT TOP 1 ESTADO FROM AGENDA WHERE ID_EMPRESA = @IdEmpresa AND ID_AGENDA = @IdAgenda) = 'CONFIRMADA') BEGIN
		SET @Mensaje = 'Esta cita ya ha sido confirmada y no puede ser cancelada'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	UPDATE AGENDA 
	SET ESTADO = 'CANCELADA' 
	WHERE ID_AGENDA = @IdAgenda 
	AND ID_EMPRESA = @IdEmpresa
END

GO