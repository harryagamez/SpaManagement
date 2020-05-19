CREATE PROCEDURE ConsultarEmpleadoServicio(@IdEmpleado VARCHAR(36))
AS
BEGIN

	SELECT ID_EMPLEADO_SERVICIO, EMPLEADOS_SERVICIOS.ID_SERVICIO,ID_EMPLEADO,RTRIM(SERVICIOS.NOMBRE) AS SERVICIO,
	(SELECT TIPO_SERVICIO.NOMBRE FROM TIPO_SERVICIO WHERE SERVICIOS.ID_TIPOSERVICIO = TIPO_SERVICIO.ID_TIPOSERVICIO AND SERVICIOS.ID_SERVICIO = EMPLEADOS_SERVICIOS.ID_SERVICIO) AS TIPOSERVICIO
	FROM EMPLEADOS_SERVICIOS INNER JOIN SERVICIOS ON SERVICIOS.ID_SERVICIO = EMPLEADOS_SERVICIOS.ID_SERVICIO 
	WHERE ID_EMPLEADO = @IdEmpleado ORDER BY SERVICIOS.NOMBRE ASC

END

GO