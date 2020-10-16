CREATE PROCEDURE ConsultarNominaEmpleadoServicios (
	@IdEmpresa	VARCHAR(36),
	@IdEmpleado INT,
	@FechaNomina CHAR(12)
)
AS
BEGIN	

	CREATE TABLE #TempEmpleado_Servicios(Id_Empresa VARCHAR(36), Id_Empleado INT, NombreApellido_Cliente CHAR(100), Id_Agenda INT, Fecha_Inicio DATETIME, Fecha_Fin DATETIME, Id_Cliente INT, Id_Servicio INT, Nombre_Servicio CHAR(100), Estado CHAR(12), Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Observaciones CHAR(200))	

	INSERT INTO #TempEmpleado_Servicios(Id_Empresa, Id_Empleado, NombreApellido_Cliente, Id_Agenda, Fecha_Inicio, Fecha_Fin, Id_Cliente, Id_Servicio, Nombre_Servicio, Estado, Fecha_Registro, Fecha_Modificacion, Observaciones)
	SELECT Agenda.ID_EMPRESA, Agenda.ID_EMPLEADO, CONCAT(RTRIM(LEFT(CLIENTES.NOMBRES,(PATINDEX('% %',CLIENTES.NOMBRES)))),' ' ,RTRIM(LEFT(CLIENTES.APELLIDOS,(PATINDEX('% %',CLIENTES.APELLIDOS))))) AS NOMBREAPELLIDO_CLIENTE, Agenda.ID_AGENDA, Agenda.FECHA_INICIO, Agenda.FECHA_FIN, Agenda.ID_CLIENTE, Agenda.ID_SERVICIO, RTRIM(Servicios.NOMBRE), Agenda.ESTADO, Agenda.FECHA_REGISTRO, Agenda.FECHA_MODIFICACION, Agenda.OBSERVACIONES
	FROM AGENDA Agenda
	INNER JOIN CLIENTES Clientes ON Clientes.ID_CLIENTE = Agenda.ID_CLIENTE
	INNER JOIN SERVICIOS Servicios on Servicios.ID_SERVICIO = Agenda.ID_SERVICIO
	WHERE Agenda.ID_EMPRESA = @IdEmpresa AND ID_EMPLEADO = @IdEmpleado AND YEAR(FECHA_INICIO) = YEAR(@FechaNomina) AND MONTH(FECHA_INICIO) = MONTH(@FechaNomina) AND Agenda.ESTADO = 'FACTURADA'

	SELECT * FROM #TempEmpleado_Servicios	

	IF OBJECT_ID('tempdb..#TempEmpleado_Servicios') IS NOT NULL DROP TABLE #TempEmpleado_Servicios	

END

GO