CREATE PROCEDURE [dbo].[ConsultarEmpleadoServicio](
	@IdEmpleado INT,
	@IdEmpresa VARCHAR (36)
)
AS
BEGIN

	SET NOCOUNT ON;

	SELECT 
		ID_EMPLEADO_SERVICIO, CAST(EMPRESA_SERVICIOS.ID_EMPRESA_SERVICIO AS VARCHAR(36)) AS ID_EMPRESA_SERVICIO, 
		EMPLEADOS_SERVICIOS.ID_SERVICIO, EMPLEADOS_SERVICIOS.APLICACION_NOMINA, 
		ID_EMPLEADO,RTRIM(SERVICIOS.NOMBRE) AS SERVICIO, 
		TIPO_SERVICIO.NOMBRE AS TIPOSERVICIO
	FROM EMPLEADOS_SERVICIOS 
	INNER JOIN SERVICIOS
	ON SERVICIOS.ID_SERVICIO = EMPLEADOS_SERVICIOS.ID_SERVICIO
	INNER JOIN TIPO_SERVICIO
	ON SERVICIOS.ID_TIPOSERVICIO = TIPO_SERVICIO.ID_TIPOSERVICIO
	INNER JOIN EMPRESA_SERVICIOS
	ON EMPLEADOS_SERVICIOS.ID_SERVICIO = EMPRESA_SERVICIOS.ID_SERVICIO 
	AND EMPRESA_SERVICIOS.ESTADO = 'ACTIVO'
	WHERE ID_EMPLEADO = @IdEmpleado 
	AND EMPRESA_SERVICIOS.ID_EMPRESA = @IdEmpresa
	ORDER BY SERVICIOS.NOMBRE ASC

END

GO