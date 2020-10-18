CREATE PROCEDURE ConsultarNominaEmpleados (
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

	CREATE TABLE #TempNomina_Empleados(Id_Empresa VARCHAR(36), Id_Empleado INT, Nombres CHAR(60), Apellidos CHAR(60), Servicios REAL, Prestamos REAL, Salario REAL, Total_Aplicado REAL, Total_Pagar REAL, Tipo_Nomina CHAR(15))	
	CREATE TABLE #TempServicios_Empleados(Id_Empresa VARCHAR(36), Id_Empleado INT, Servicios REAL)
	CREATE TABLE #TempPrestamos_Empleados(Id_Empresa VARCHAR(36), Id_Empleado INT, Prestamos REAL)

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

		INSERT INTO #TempPrestamos_Empleados (Id_Empresa, Id_Empleado, Prestamos)		
		SELECT 
			ID_EMPRESA, ID_EMPLEADO, 
			SUM(VALOR) AS PRESTAMO
		FROM GASTOS
		WHERE ID_EMPRESA = @IdEmpresa 
		AND ESTADO = 'ASIGNADO'
		GROUP BY ID_EMPRESA, ID_EMPLEADO
		
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

			INSERT INTO #TempPrestamos_Empleados (Id_Empresa, Id_Empleado, Prestamos)				
			SELECT 
				ID_EMPRESA, ID_EMPLEADO, 
				SUM(VALOR) AS PRESTAMO
			FROM GASTOS
			WHERE ID_EMPRESA = @IdEmpresa 
			AND ESTADO = 'ASIGNADO'
			GROUP BY ID_EMPRESA, ID_EMPLEADO
			
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

			INSERT INTO #TempPrestamos_Empleados (Id_Empresa, Id_Empleado, Prestamos)				
			SELECT 
				ID_EMPRESA, ID_EMPLEADO, 
				SUM(VALOR) AS TOTAL_PRESTAMO
			FROM GASTOS
			WHERE ID_EMPRESA = @IdEmpresa 
			AND ESTADO = 'ASIGNADO'
			GROUP BY ID_EMPRESA, ID_EMPLEADO
			
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
		
		INSERT INTO #TempPrestamos_Empleados (Id_Empresa, Id_Empleado, Prestamos)			
		SELECT 
			ID_EMPRESA, ID_EMPLEADO, 
			SUM(VALOR) AS TOTAL_PRESTAMO
		FROM GASTOS
		WHERE ID_EMPRESA = @IdEmpresa 
		AND ESTADO = 'ASIGNADO'
		GROUP BY ID_EMPRESA, ID_EMPLEADO
		
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
		ON EMPRESA_SERVICIOS.ID_SERVICIO = Agenda.ID_SERVICIO
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
		
		INSERT INTO #TempPrestamos_Empleados (Id_Empresa, Id_Empleado, Prestamos)		
		SELECT ID_EMPRESA, ID_EMPLEADO, SUM(VALOR) AS TOTAL_PRESTAMO
		FROM GASTOS
		WHERE ID_EMPRESA = @IdEmpresa AND ESTADO = 'ASIGNADO'
		GROUP BY ID_EMPRESA, ID_EMPLEADO
		
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
		SELECT 
			Id_Empresa, Id_Empleado, Nombres, Apellidos, Servicios, Prestamos, 
			Salario, (Servicios * Salario) AS Total_Aplicado, ((Servicios * Salario) - ISNULL(Prestamos, 0)) AS Total_Pagar, 
			RTRIM(Tipo_Nomina) AS Tipo_Nomina
		FROM #TempNomina_Empleados
	END
	ELSE BEGIN
		SELECT 
			Id_Empresa, Id_Empleado, Nombres, Apellidos, Servicios, Prestamos, 
			Salario, (Salario) AS Total_Aplicado, (Salario - ISNULL(Prestamos, 0)) AS Total_Pagar, 
			RTRIM(Tipo_Nomina) AS Tipo_Nomina
		FROM #TempNomina_Empleados		
	END

	IF OBJECT_ID('tempdb..#TempNomina_Empleados') IS NOT NULL DROP TABLE #TempNomina_Empleados
	IF OBJECT_ID('tempdb..#TempServicios_Empleados') IS NOT NULL DROP TABLE #TempServicios_Empleados
	IF OBJECT_ID('tempdb..#TempPrestamos_Empleados') IS NOT NULL DROP TABLE #TempPrestamos_Empleados

END

GO
