CREATE PROCEDURE [dbo].[ConsultarMovimientosCajaMenor] (
	@IdEmpresa	VARCHAR(36),
	@FechaDesde DATE,
	@FechaHasta DATE
)
AS
BEGIN

	DECLARE @Distribucion CHAR(12)
	DECLARE @StartDate DATE
	DECLARE @EndDate DATE

	SET @StartDate = @FechaDesde
	SET @EndDate = @FechaHasta

	CREATE TABLE #TempMovimientos (SaldoInicial DECIMAL(18,2), Acumulado DECIMAL (18,2), Fecha DATE, Compras DECIMAL(18,2), 
	Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))
	
	CREATE TABLE #TempGastos (Fecha CHAR(10), Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), 
	Varios DECIMAL(18,2))
	
	CREATE TABLE #TempGastosFinal (Fecha CHAR(10), Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), 
	Varios DECIMAL(18,2))

	CREATE TABLE #TempClientePagos (Fecha CHAR(10), Facturado DECIMAL(18,2))	

	IF((SELECT TOP 1 DIA FROM CAJA_MENOR WHERE ID_EMPRESA = @IdEmpresa ORDER BY ID_REGISTRO DESC) IS NULL) BEGIN
		SET @Distribucion = 'MENSUAL'
	END
	ELSE BEGIN
		SET @Distribucion = 'DIARIA'
	END

	;WITH CTE AS (
		SELECT @StartDate AS myDate
		UNION ALL
		SELECT DATEADD(DAY, 1, myDate) AS myDate
		FROM CTE
		WHERE DATEADD(DAY, 1, myDate) <= @EndDate
	)

	INSERT INTO #TempMovimientos (Fecha)
	SELECT myDate
	FROM CTE
	OPTION (MAXRECURSION 0)

	INSERT INTO #TempGastos (Fecha, Compras, Nomina, Prestamos, Servicios, Varios)
	SELECT 
		CONVERT(VARCHAR(10),FECHA,121) AS Fecha, 
		CASE WHEN (TIPO_GASTO = 'COMPRAS') THEN VALOR END AS Compras, 
		CASE WHEN (TIPO_GASTO = 'NOMINA') THEN VALOR END AS Nomina,
		CASE WHEN (TIPO_GASTO = 'PRESTAMOS') THEN VALOR END AS Prestamos,
		CASE WHEN (TIPO_GASTO = 'SERVICIOS') THEN VALOR END AS Servicios,
		CASE WHEN (TIPO_GASTO = 'VARIOS') THEN VALOR END AS Varios
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa 
	AND CONVERT(VARCHAR(10), FECHA, 121) BETWEEN @FechaDesde AND @FechaHasta	

	INSERT INTO #TempGastosFinal (Fecha, Compras, Nomina, Prestamos, Servicios, Varios)
	SELECT
		Fecha,
		SUM(Compras) AS Compras,
		SUM(Nomina) AS Nomina,
		SUM(Prestamos) AS Prestamos,
		SUM(Servicios) AS Servicios,
		SUM(Varios) AS Varios
	FROM #TempGastos
	GROUP BY Fecha	

	INSERT INTO #TempClientePagos (Fecha, Facturado)
	SELECT
		CONVERT(VARCHAR(10), FECHA, 121) AS Fecha,
		SUM(TOTAL_PAGADO) AS Facturado
	FROM CLIENTE_PAGOS
	WHERE ID_EMPRESA = @IdEmpresa 
	AND CONVERT(VARCHAR(10), FECHA, 121) BETWEEN @FechaDesde AND @FechaHasta
	GROUP BY Fecha

	UPDATE Movimientos SET 
		Compras = Gastos.Compras,
		Nomina = Gastos.Nomina,
		Prestamos = Gastos.Prestamos,
		Servicios = Gastos.Servicios,
		Varios = Gastos.Varios		
	FROM #TempMovimientos Movimientos
	INNER JOIN #TempGastosFinal Gastos 
	ON Movimientos.Fecha = Gastos.Fecha	

	UPDATE Movimientos SET 
		Facturado = ClientePagos.Facturado
	FROM #TempMovimientos Movimientos	
	INNER JOIN #TempClientePagos ClientePagos 
	ON Movimientos.Fecha = ClientePagos.Fecha

	IF(@Distribucion = 'MENSUAL') BEGIN

		UPDATE Movimientos SET			
			SaldoInicial = CAJA_MENOR.SALDO_INICIAL
		FROM #TempMovimientos Movimientos
		INNER JOIN CAJA_MENOR ON YEAR(CAJA_MENOR.FECHA_REGISTRO) = YEAR(Movimientos.Fecha) 
		AND MONTH(CAJA_MENOR.FECHA_REGISTRO) = MONTH(Movimientos.Fecha)
		AND DIA IS NULL
		WHERE ID_EMPRESA = @IdEmpresa
		
	END
	ELSE BEGIN
		UPDATE Movimientos SET 			
			SaldoInicial = CAJA_MENOR.SALDO_INICIAL
		FROM #TempMovimientos Movimientos
		INNER JOIN CAJA_MENOR ON CONVERT(VARCHAR(10), CAJA_MENOR.DIA, 121) = Movimientos.Fecha 
		WHERE ID_EMPRESA = @IdEmpresa

	END

	UPDATE Movimientos SET
		Acumulado = ACUMULADOS_CAJA.VALOR
	FROM #TempMovimientos Movimientos
	INNER JOIN ACUMULADOS_CAJA ON CONVERT(VARCHAR(10), ACUMULADOS_CAJA.FECHA_REGISTRO, 121) = Movimientos.Fecha
	WHERE ID_EMPRESA = @IdEmpresa	

	SELECT 
		ISNULL(SaldoInicial, 0) AS SaldoInicial, 
		ISNULL(Acumulado, 0) AS Acumulado, 
		RTRIM(Fecha) AS Fecha, 
		ISNULL(Compras, 0) AS Compras, 
		ISNULL(Nomina, 0) AS Nomina, 
		ISNULL(Prestamos, 0) AS Prestamos, 
		ISNULL(Servicios, 0) AS Servicios, 
		ISNULL(Varios, 0) AS Varios, 
		ISNULL(Facturado, 0) AS Facturado
	FROM #TempMovimientos
	WHERE Acumulado IS NOT NULL
	ORDER BY Fecha DESC	

	IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos
	IF OBJECT_ID('tempdb..#TempGastosFinal') IS NOT NULL DROP TABLE #TempGastosFinal
	IF OBJECT_ID('tempdb..#TempClientePagos') IS NOT NULL DROP TABLE #TempClientePagos	
	IF OBJECT_ID('tempdb..#TempMovimientos') IS NOT NULL DROP TABLE #TempMovimientos

END

GO