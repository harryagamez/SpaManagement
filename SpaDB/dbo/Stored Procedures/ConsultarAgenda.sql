CREATE PROCEDURE ConsultarAgenda(@JsonAgenda NVARCHAR(MAX))
AS
BEGIN

	DECLARE @IdEmpleado INT
	DECLARE @IdCliente INT
	DECLARE @IdServicio INT
	DECLARE @FechaBusqueda DATE
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @Estado CHAR(12)

	DECLARE @statement NVARCHAR(MAX) = N'';

	CREATE TABLE #TempBusquedaAgenda (Id_Agenda INT, Fecha_Inicio DATETIME, Fecha_Fin DATETIME, Id_Cliente INT,
	Id_Servicio INT, Id_Empleado INT, Estado CHAR(12), Id_Empresa UNIQUEIDENTIFIER)

	INSERT INTO #TempBusquedaAgenda (Id_Agenda, Fecha_Inicio, Fecha_Fin, Id_Cliente, Id_Servicio, Id_Empleado, Estado, Id_Empresa)
	SELECT
		Id_Agenda, Fecha_Inicio, Fecha_Fin, Id_Cliente, 
		Id_Servicio, Id_Empleado, Estado, Id_Empresa
	FROM
		OPENJSON(@JsonAgenda)
	WITH (
		Id_Agenda INT '$.Id_Agenda', Fecha_Inicio DATETIME '$.Fecha_Inicio',
		Fecha_Fin DATETIME '$.Fecha_Fin', Id_Cliente INT '$.Id_Cliente',
		Id_Servicio INT '$.Id_Servicio', Id_Empleado INT '$.Id_Empleado',
		Estado CHAR(12) '$.Estado', Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa'
	)
		
	SET @IdEmpleado = (SELECT TOP 1 Id_Empleado FROM #TempBusquedaAgenda)	
	SET @IdCliente = (SELECT TOP 1 Id_Cliente FROM #TempBusquedaAgenda)
	SET @IdServicio = (SELECT TOP 1 Id_Servicio FROM #TempBusquedaAgenda)
	SET @FechaBusqueda = (SELECT TOP 1 CAST(Fecha_Inicio AS DATE) FROM #TempBusquedaAgenda)
	SET @IdEmpresa = (SELECT TOP 1 Id_Empresa FROM #TempBusquedaAgenda)
	SET @Estado = (SELECT TOP 1 Estado FROM #TempBusquedaAgenda)


	SET @statement = @statement + N' 
	SELECT ID_AGENDA, 
		SUBSTRING(CONVERT(VARCHAR(20),FECHA_INICIO,22), 10, 11) AS FECHAINICIO, 
		SUBSTRING(CONVERT(VARCHAR(20),FECHA_FIN,22), 10, 11) AS FECHAFIN, 
		AGENDA.ID_CLIENTE AS ID_CLIENTE, 
		AGENDA.ID_SERVICIO AS ID_SERVICIO, 
		AGENDA.ID_EMPLEADO AS ID_EMPLEADO, 
		RTRIM(AGENDA.ESTADO) AS ESTADO, 
		RTRIM(AGENDA.ID_EMPRESA) AS ID_EMPRESA, 
		AGENDA.FECHA_REGISTRO AS FECHA_REGISTRO, 
		AGENDA.FECHA_MODIFICACION AS FECHA_MODIFICACION, 
		RTRIM(OBSERVACIONES) AS OBSERVACIONES, 
		CONCAT(RTRIM(LEFT(CLIENTES.NOMBRES,(PATINDEX(''% %'',CLIENTES.NOMBRES)))),'' '' ,RTRIM(LEFT(CLIENTES.APELLIDOS,(PATINDEX(''% %'',CLIENTES.APELLIDOS))))) AS NOMBRES_CLIENTE, 
		CONCAT(RTRIM(LEFT(EMPLEADOS.NOMBRES,(PATINDEX(''% %'',EMPLEADOS.NOMBRES)))),'' '' ,RTRIM(LEFT(EMPLEADOS.APELLIDOS,(PATINDEX(''% %'',EMPLEADOS.APELLIDOS))))) AS NOMBRES_EMPLEADO, 
		RTRIM(SERVICIOS.NOMBRE) AS NOMBRE_SERVICIO
	FROM AGENDA
		INNER JOIN CLIENTES ON AGENDA.ID_CLIENTE = CLIENTES.ID_CLIENTE
		INNER JOIN EMPLEADOS ON AGENDA.ID_EMPLEADO = EMPLEADOS.ID_EMPLEADO
		INNER JOIN SERVICIOS ON AGENDA.ID_SERVICIO = SERVICIOS.ID_SERVICIO		
	WHERE CONVERT(VARCHAR(10),FECHA_INICIO,120) =  @FechaBusqueda AND AGENDA.ID_EMPRESA = @IdEmpresa '

	IF @IdEmpleado <> -1 BEGIN
		SET @statement = @statement + N' AND AGENDA.ID_EMPLEADO = @IdEmpleado '
	END

	IF @IdCliente <> -1 BEGIN
		SET @statement = @statement + N' AND AGENDA.ID_CLIENTE = @IdCliente '
	END

	IF @IdServicio <> -1 BEGIN
		SET @statement = @statement + N' AND AGENDA.ID_SERVICIO = @IdServicio '
	END

	IF @Estado IS NOT NULL BEGIN
		SET @statement = @statement + N' AND AGENDA.ESTADO = @Estado '
	END

	SET @statement = @statement + N' ORDER BY FECHA_INICIO DESC'

	EXECUTE sp_executesql @statement,
	N'@FechaBusqueda DATE, @IdEmpresa VARCHAR(36), @IdCliente INT, @IdEmpleado INT, @IdServicio INT, @Estado CHAR(12)',
	@FechaBusqueda, @IdEmpresa, @IdCliente, @IdEmpleado, @IdServicio, @Estado

END

GO