CREATE PROCEDURE [dbo].[ConsultarNumeroCitasDia](
	@FechaConsulta CHAR(12), 
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN
	SELECT 
		COUNT(ID_AGENDA) 
	FROM AGENDA WHERE ID_EMPRESA = @IdEmpresa 
	AND CONVERT(VARCHAR(10),FECHA_INICIO,103) = @FechaConsulta 
	AND (ESTADO = 'PROGRAMADA' OR ESTADO = 'CONFIRMADA')
END

GO
