CREATE PROCEDURE [dbo].[ConsultarNominaEmpleados](
	@IdEmpresa	VARCHAR(36),
	@FechaNomina CHAR(12)
)
AS
BEGIN

	DECLARE @TipoNomina CHAR(15)

	SET @TipoNomina = (
		SELECT 
			TOP 1 VALOR_PROPIEDAD 
		FROM EMPRESA_PROPIEDADES 
		WHERE ID_EMPRESA = @IdEmpresa 
		AND (VALOR_PROPIEDAD = 'MENSUAL' 
		OR VALOR_PROPIEDAD = 'QUINCENAL' 
		OR VALOR_PROPIEDAD = 'DIARIO' 
		OR VALOR_PROPIEDAD = 'POR_SERVICIOS')
	)
	
	IF (@TipoNomina IS NULL) BEGIN
		DECLARE @Mensaje CHAR(200) = 'Para consultar la nómina, debe configurar el tipo de nómina de la empresa'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	CREATE TABLE #TempNomina_Empleados(Id_Empresa VARCHAR(36), Id_Empleado INT, Nombres CHAR(60), Apellidos CHAR(60), Servicios DECIMAL(18,2), Prestamos DECIMAL(18,2), Salario DECIMAL(18,3), Subtotal DECIMAL(18,2), Total_Pagar DECIMAL(18,2), Tipo_Nomina CHAR(15), Set_Tooltip BIT)	
	CREATE TABLE #TempServicios_Empleados(Id_Empresa VARCHAR(36), Id_Empleado INT, Servicios DECIMAL(18,2))
	CREATE TABLE #TempServicios_Empleados_Monto(Id_Empresa VARCHAR(36), Id_Empleado INT, Porcentaje DECIMAL(18,3), Set_Tooltip INT)
	CREATE TABLE #TempPrestamos_Empleados(Id_Empresa VARCHAR(36), Id_Empleado INT, Prestamos DECIMAL(18,2))

	INSERT INTO #TempPrestamos_Empleados (Id_Empresa, Id_Empleado, Prestamos)		
	SELECT 
		ID_EMPRESA, ID_EMPLEADO, 
		SUM(VALOR) AS PRESTAMO
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa 
	AND ESTADO = 'ASIGNADO'
	GROUP BY ID_EMPRESA, ID_EMPLEADO
	
	IF(@TipoNomina = 'MENSUAL') BEGIN
	
		INSERT INTO #TempNomina_Empleados (Id_Empresa, Id_Empleado, Nombres, Apellidos, Salario)		
		SELECT 
			Empleados.ID_EMPRESA, Empleados.ID_EMPLEADO, Empleados.NOMBRES, 
			Empleados.APELLIDOS, Empleados.MONTO
		FROM EMPLEADOS Empleados
		LEFT JOIN LIQUIDACIONES Liquidaciones 
		ON Liquidaciones.ID_EMPLEADO = Empleados.ID_EMPLEADO 
		AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
		AND Liquidaciones.MES = MONTH(@FechaNomina)
		WHERE Liquidaciones.ID_EMPLEADO IS NULL 
		AND Empleados.ID_EMPRESA = @IdEmpresa
		
	END

	IF(@TipoNomina = 'QUINCENAL') BEGIN

		IF(DAY(@FechaNomina) <= 15) BEGIN
		
			INSERT INTO #TempNomina_Empleados (Id_Empresa, Id_Empleado, Nombres, Apellidos, Salario)			
			SELECT 
				Empleados.ID_EMPRESA, Empleados.ID_EMPLEADO, Empleados.NOMBRES, 
				Empleados.APELLIDOS, Empleados.MONTO
			FROM EMPLEADOS Empleados
			LEFT JOIN LIQUIDACIONES Liquidaciones 
			ON Liquidaciones.ID_EMPLEADO = Empleados.ID_EMPLEADO 
			AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
			AND Liquidaciones.MES = MONTH(@FechaNomina) 
			AND Liquidaciones.QUINCENA = 1
			WHERE Liquidaciones.ID_EMPLEADO IS NULL 
			AND Empleados.ID_EMPRESA = @IdEmpresa
			
		END

		IF(DAY(@FechaNomina) > 15) BEGIN
		
			INSERT INTO #TempNomina_Empleados (Id_Empresa, Id_Empleado, Nombres, Apellidos, Salario)			
			SELECT 
				Empleados.ID_EMPRESA, Empleados.ID_EMPLEADO, Empleados.NOMBRES, 
				Empleados.APELLIDOS, Empleados.MONTO
			FROM EMPLEADOS Empleados
			LEFT JOIN LIQUIDACIONES Liquidaciones 
			ON Liquidaciones.ID_EMPLEADO = Empleados.ID_EMPLEADO 
			AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
			AND Liquidaciones.MES = MONTH(@FechaNomina) 
			AND Liquidaciones.QUINCENA = 2
			WHERE Liquidaciones.ID_EMPLEADO IS NULL 
			AND Empleados.ID_EMPRESA = @IdEmpresa
			
		END

	END

	IF(@TipoNomina = 'DIARIO') BEGIN
		
		INSERT INTO #TempNomina_Empleados (Id_Empresa, Id_Empleado, Nombres, Apellidos, Salario)		
		SELECT 
			Empleados.ID_EMPRESA, Empleados.ID_EMPLEADO, Empleados.NOMBRES, 
			Empleados.APELLIDOS, Empleados.MONTO
		FROM EMPLEADOS Empleados
		LEFT JOIN LIQUIDACIONES Liquidaciones 
		ON Liquidaciones.ID_EMPLEADO = Empleados.ID_EMPLEADO 
		AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
		AND Liquidaciones.MES = MONTH(@FechaNomina) 
		AND DAY(Liquidaciones.DIA) = DAY(@FechaNomina)
		WHERE Liquidaciones.ID_EMPLEADO IS NULL 
		AND Empleados.ID_EMPRESA = @IdEmpresa
		
	END

	IF(@TipoNomina = 'POR_SERVICIOS') BEGIN
	
		INSERT INTO #TempNomina_Empleados (Id_Empresa, Id_Empleado, Nombres, Apellidos, Salario)		
		SELECT 
			Empleados.ID_EMPRESA, Empleados.ID_EMPLEADO, Empleados.NOMBRES, 
			Empleados.APELLIDOS, Empleados.MONTO
		FROM EMPLEADOS Empleados
		LEFT JOIN LIQUIDACIONES Liquidaciones 
		ON Liquidaciones.ID_EMPLEADO = Empleados.ID_EMPLEADO 
		AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
		AND Liquidaciones.MES = MONTH(@FechaNomina)
		WHERE Liquidaciones.ID_EMPLEADO IS NULL 
		AND Empleados.ID_EMPRESA = @IdEmpresa 
		
		INSERT INTO #TempServicios_Empleados (Id_Empresa, Id_Empleado, Servicios)			
		SELECT 
			Agenda.ID_EMPRESA, Agenda.ID_EMPLEADO, 
			SUM(EMPRESA_SERVICIOS.VALOR)
		FROM AGENDA Agenda
		INNER JOIN EMPRESA_SERVICIOS 
		ON EMPRESA_SERVICIOS.ID_SERVICIO = Agenda.ID_SERVICIO AND EMPRESA_SERVICIOS.ID_EMPRESA = Agenda.ID_EMPRESA
		LEFT JOIN LIQUIDACIONES Liquidaciones 
		ON Liquidaciones.ID_EMPLEADO = Agenda.ID_EMPLEADO 
		AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
		AND Liquidaciones.MES = MONTH(@FechaNomina)
		WHERE Liquidaciones.ID_EMPLEADO IS NULL 
		AND (Agenda.ID_EMPRESA = @IdEmpresa 
		AND Agenda.ESTADO = 'FACTURADA' 
		AND YEAR(Agenda.FECHA_INICIO) = YEAR(@FechaNomina) 
		AND MONTH(Agenda.FECHA_INICIO) = MONTH(@FechaNomina))
		GROUP BY Agenda.ID_EMPRESA, Agenda.ID_EMPLEADO

		INSERT INTO #TempServicios_Empleados_Monto(Id_Empresa, Id_Empleado, Porcentaje)
		SELECT
			Agenda.ID_EMPRESA, 
			Agenda.ID_EMPLEADO,
			CASE 
				WHEN EMPLEADOS_SERVICIOS.APLICACION_NOMINA IS NOT NULL THEN EMPLEADOS_SERVICIOS.APLICACION_NOMINA
				WHEN EMPRESA_SERVICIOS.APLICACION_NOMINA IS NOT NULL THEN EMPRESA_SERVICIOS.APLICACION_NOMINA 
				ELSE EMPLEADOS.MONTO END AS Porcentaje
		FROM AGENDA Agenda
		INNER JOIN EMPLEADOS 
		ON Agenda.ID_EMPLEADO = EMPLEADOS.ID_EMPLEADO
		INNER JOIN EMPLEADOS_SERVICIOS
		ON Agenda.ID_EMPLEADO = EMPLEADOS_SERVICIOS.ID_EMPLEADO AND Agenda.ID_SERVICIO = EMPLEADOS_SERVICIOS.ID_SERVICIO
		INNER JOIN EMPRESA_SERVICIOS
		ON EMPRESA_SERVICIOS.ID_SERVICIO = Agenda.ID_SERVICIO AND EMPRESA_SERVICIOS.ID_EMPRESA = Agenda.ID_EMPRESA
		LEFT JOIN LIQUIDACIONES Liquidaciones 
		ON Liquidaciones.ID_EMPLEADO = Agenda.ID_EMPLEADO 
		AND Liquidaciones.ANIO = YEAR(@FechaNomina) 
		AND Liquidaciones.MES = MONTH(@FechaNomina)
		WHERE Liquidaciones.ID_EMPLEADO IS NULL 
		AND (Agenda.ID_EMPRESA = @IdEmpresa 
		AND Agenda.ESTADO = 'FACTURADA' 
		AND YEAR(Agenda.FECHA_INICIO) = YEAR(@FechaNomina) 
		AND MONTH(Agenda.FECHA_INICIO) = MONTH(@FechaNomina))

		UPDATE Monto SET
		Set_Tooltip = 1
		FROM #TempServicios_Empleados_Monto Monto
		INNER JOIN EMPLEADOS Empleados ON Monto.Id_Empleado = Empleados.ID_EMPLEADO
		WHERE Monto.Porcentaje <> Empleados.MONTO		

		UPDATE NominaEmpleados SET
		Salario = (SELECT AVG(CAST(Porcentaje AS DECIMAL(18,3))) FROM #TempServicios_Empleados_Monto WHERE Id_Empleado = NominaEmpleados.Id_Empleado) 
		FROM #TempNomina_Empleados NominaEmpleados
		
		UPDATE NominaEmpleados SET
		Set_Tooltip = 1		
		FROM #TempNomina_Empleados NominaEmpleados		
		INNER JOIN EMPLEADOS Empleados ON NominaEmpleados.Id_Empleado = Empleados.ID_EMPLEADO
		WHERE NominaEmpleados.Salario <> Empleados.MONTO
		
	END

	UPDATE NominaEmpleados
		SET NominaEmpleados.Servicios = ServiciosEmpleados.Servicios
	FROM #TempNomina_Empleados NominaEmpleados
	INNER JOIN #TempServicios_Empleados ServiciosEmpleados 
	ON ServiciosEmpleados.Id_Empleado = NominaEmpleados.Id_Empleado 
	AND ServiciosEmpleados.Id_Empresa = NominaEmpleados.Id_Empresa	

	UPDATE NominaEmpleados
		SET NominaEmpleados.Prestamos = PrestamosEmpleados.Prestamos
	FROM #TempNomina_Empleados NominaEmpleados
	INNER JOIN #TempPrestamos_Empleados PrestamosEmpleados 
	ON PrestamosEmpleados.Id_Empleado = NominaEmpleados.Id_Empleado 
	AND PrestamosEmpleados.Id_Empresa = NominaEmpleados.Id_Empresa	

	UPDATE NominaEmpleados
		SET NominaEmpleados.Tipo_Nomina = @TipoNomina
	FROM #TempNomina_Empleados NominaEmpleados
	
	IF(@TipoNomina = 'POR_SERVICIOS') BEGIN
		UPDATE #TempNomina_Empleados
		SET Subtotal = (ISNULL(Servicios, 0) * ISNULL(Salario, 0)), Total_Pagar = ((ISNULL(Servicios, 0) * ISNULL(Salario, 0)) - ISNULL(Prestamos,0))		

		SELECT 
			Id_Empresa, Id_Empleado, RTRIM(Nombres) AS Nombres, RTRIM(Apellidos) AS Apellidos, Servicios, Prestamos, 
			Salario, Subtotal, Total_Pagar, 
			RTRIM(Tipo_Nomina) AS Tipo_Nomina,
			ISNULL(Set_Tooltip, 0) AS Set_Tooltip
		FROM #TempNomina_Empleados
		WHERE (ISNULL(Subtotal, 0) > 0 OR ISNULL(Prestamos, 0) > 0)
	END
	ELSE BEGIN
		UPDATE #TempNomina_Empleados
		SET Subtotal = Salario, Total_Pagar = (Salario - ISNULL(Prestamos, 0))
		 
		 SELECT 
			Id_Empresa, Id_Empleado, RTRIM(Nombres) AS Nombres, RTRIM(Apellidos) AS Apellidos, Servicios, Prestamos, 
			Salario, Subtotal, Total_Pagar, 
			RTRIM(Tipo_Nomina) AS Tipo_Nomina,
			ISNULL(Set_Tooltip, 0) AS Set_Tooltip
		 FROM #TempNomina_Empleados
	END

	IF OBJECT_ID('tempdb..#TempNomina_Empleados') IS NOT NULL DROP TABLE #TempNomina_Empleados
	IF OBJECT_ID('tempdb..#TempServicios_Empleados') IS NOT NULL DROP TABLE #TempServicios_Empleados
	IF OBJECT_ID('tempdb..#TempPrestamos_Empleados') IS NOT NULL DROP TABLE #TempPrestamos_Empleados

END
