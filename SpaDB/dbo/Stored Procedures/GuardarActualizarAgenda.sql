CREATE PROCEDURE GuardarActualizarAgenda(@JsonAgenda NVARCHAR(MAX))
AS
BEGIN

	DECLARE @IdEmpleado INT
	DECLARE @IdCliente INT
	DECLARE @FechaAgendaCita DATE
	DECLARE @HoraInicio VARCHAR(8)
	DECLARE @HoraFin VARCHAR(8)
	DECLARE @Mensaje VARCHAR(200)

	CREATE TABLE #TempAgendaCita (Id_Agenda INT, Fecha_Inicio DATETIME, Fecha_Fin DATETIME, Id_Cliente INT,
		Id_Servicio INT, Id_Empleado INT, Estado VARCHAR(12), Id_Empresa UNIQUEIDENTIFIER, Observaciones CHAR(200))

	INSERT INTO #TempAgendaCita(Id_Agenda, Fecha_Inicio, Fecha_Fin, Id_Cliente, Id_Servicio, Id_Empleado, Estado, Id_Empresa, Observaciones)
	SELECT 
		Id_Agenda, Fecha_Inicio, Fecha_Fin, Id_Cliente,
		Id_Servicio, Id_Empleado, Estado, Id_Empresa, Observaciones
	FROM 
		OPENJSON(@JsonAgenda)
	WITH (
		Id_Agenda INT '$.Id_Agenda', Fecha_Inicio DATETIME '$.Fecha_Inicio',
		Fecha_Fin DATETIME '$.Fecha_Fin', Id_Cliente INT '$.Id_Cliente',
		Id_Servicio INT '$.Id_Servicio', Id_Empleado INT '$.Id_Empleado',
		Estado VARCHAR(12) '$.Estado', Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa',
		Observaciones CHAR(200) '$.Observaciones'
	)

	SET @IdEmpleado = (SELECT TOP 1 Id_Empleado FROM #TempAgendaCita)
	SET @IdCliente = (SELECT TOP 1 Id_Cliente FROM #TempAgendaCita)
	SET @FechaAgendaCita = (SELECT TOP 1 CAST(Fecha_Inicio AS DATE) FROM #TempAgendaCita)
	SET @HoraInicio = (SELECT TOP 1 SUBSTRING(CONVERT(CHAR(38),Fecha_Inicio,121),12,8) FROM #TempAgendaCita)
	SET @HoraFin = (SELECT TOP 1 SUBSTRING(CONVERT(CHAR(38),Fecha_Fin,121),12,8) FROM #TempAgendaCita)

	;WITH EmpleadoCitas AS (
		SELECT 
			ID_AGENDA,ID_EMPLEADO, ID_CLIENTE,ESTADO, 
			SUBSTRING(CONVERT(CHAR(38),FECHA_INICIO,121),12,8) AS Hora_Inicio,
			SUBSTRING(CONVERT(CHAR(38),FECHA_FIN,121),12,8) AS Hora_Fin  
		FROM AGENDA 
		WHERE CONVERT(CHAR(10),FECHA_INICIO,120) = @FechaAgendaCita 
		AND ID_EMPLEADO = @IdEmpleado AND ESTADO = 'PROGRAMADA'
	)

	SELECT
		ID_AGENDA,ID_EMPLEADO, ID_CLIENTE,
		ESTADO, Hora_Inicio, Hora_Fin
	INTO #TempCitasEmpleados
	FROM EmpleadoCitas
	WHERE (@HoraInicio > Hora_Inicio AND @HoraFin < Hora_Fin)
	OR (@HoraInicio < Hora_Fin AND @HoraFin > Hora_Inicio)

	IF (SELECT COUNT(ID_AGENDA) FROM #TempCitasEmpleados) > 0 BEGIN
		SET @Mensaje = 'Empleado no disponible entre las ' + @HoraInicio + ' y las ' + @HoraFin + '. Debe seleccionar otra hora'
		RAISERROR (@Mensaje, 16, 1)
		IF OBJECT_ID('tempdb..#TempAgendaCita') IS NOT NULL DROP TABLE #TempAgendaCita
		IF OBJECT_ID('tempdb..#TempCitasEmpleados') IS NOT NULL DROP TABLE #TempCitasEmpleados
		RETURN
	END

	;WITH ClienteCitas AS (
		SELECT 
			ID_AGENDA,ID_EMPLEADO, ID_CLIENTE,ESTADO, 
			SUBSTRING(CONVERT(CHAR(38),FECHA_INICIO,121),12,8) AS Hora_Inicio,
			SUBSTRING(CONVERT(CHAR(38),FECHA_FIN,121),12,8) AS Hora_Fin  
		FROM AGENDA 
		WHERE CONVERT(CHAR(10),FECHA_INICIO,120) = @FechaAgendaCita 
		AND ID_CLIENTE = @IdCliente AND ESTADO = 'PROGRAMADA'
	)

	SELECT
		ID_AGENDA,ID_EMPLEADO, ID_CLIENTE,
		ESTADO, Hora_Inicio, Hora_Fin
	INTO #TempCitasClientes
	FROM ClienteCitas
	WHERE (@HoraInicio > Hora_Inicio AND @HoraFin < Hora_Fin)
	OR (@HoraInicio < Hora_Fin AND @HoraFin > Hora_Inicio) 

	IF (SELECT COUNT(ID_AGENDA) FROM #TempCitasClientes) > 0 BEGIN
		SET @Mensaje = 'El cliente ya tiene un servicio programado para la hora seleccionada'
		RAISERROR (@Mensaje, 16, 1)
		IF OBJECT_ID('tempdb..#TempAgendaCita') IS NOT NULL DROP TABLE #TempAgendaCita
		IF OBJECT_ID('tempdb..#TempCitasEmpleados') IS NOT NULL DROP TABLE #TempCitasEmpleados
		IF OBJECT_ID('tempdb..#TempCitasClientes') IS NOT NULL DROP TABLE #TempCitasClientes
		RETURN
	END

	BEGIN TRY

		MERGE AGENDA AS TARGET
		USING #TempAgendaCita AS SOURCE
		ON TARGET.ID_AGENDA = SOURCE.Id_Agenda AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa
		WHEN MATCHED THEN
			UPDATE SET TARGET.FECHA_INICIO = SOURCE.Fecha_Inicio, TARGET.FECHA_FIN = SOURCE.Fecha_Fin, TARGET.ID_CLIENTE = SOURCE.Id_Cliente,
			TARGET.ID_SERVICIO = SOURCE.Id_Servicio, TARGET.ID_EMPLEADO = SOURCE.Id_Empleado, TARGET.ESTADO = SOURCE.Estado,
			TARGET.FECHA_MODIFICACION = GETDATE(), TARGET.OBSERVACIONES = SOURCE.Observaciones
		WHEN NOT MATCHED THEN
			INSERT (FECHA_INICIO, FECHA_FIN, ID_CLIENTE, ID_SERVICIO, ID_EMPLEADO, ESTADO, ID_EMPRESA, FECHA_REGISTRO, FECHA_MODIFICACION, OBSERVACIONES)
			VALUES (SOURCE.Fecha_Inicio, SOURCE.Fecha_Fin, SOURCE.Id_Cliente, SOURCE.Id_Servicio, SOURCE.Id_Empleado, SOURCE.Estado, SOURCE.Id_Empresa,
			GETDATE(), GETDATE(), SOURCE.Observaciones);

	END TRY

	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempAgendaCita') IS NOT NULL DROP TABLE #TempAgendaCita
		IF OBJECT_ID('tempdb..#TempCitasEmpleados') IS NOT NULL DROP TABLE #TempCitasEmpleados
		IF OBJECT_ID('tempdb..#TempCitasClientes') IS NOT NULL DROP TABLE #TempCitasClientes
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO