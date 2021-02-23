CREATE PROCEDURE [dbo].[DesasignarEmpleadoServicio](
	@IdEmpleadoServicio INT
)
AS
BEGIN
	
	DELETE 
	FROM EMPLEADOS_SERVICIOS 
	WHERE ID_EMPLEADO_SERVICIO = @IdEmpleadoServicio

END

GO