CREATE PROCEDURE ConsultarMovimientosCajaMenor(
	@IdEmpresa	VARCHAR(36),
	@FechaDesde CHAR(10),
	@FechaHasta CHAR(10)
)
AS
BEGIN

	DECLARE @Distribucion CHAR(12)
	DECLARE @StartDate DATE = @FechaDesde
	DECLARE @EndDate DATE = @FechaHasta

	CREATE TABLE #TempMovimientos (Saldo_Inicial DECIMAL(18,2), Acumulado DECIMAL (18,2), Fecha CHAR(10), Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))
	
	CREATE TABLE #TempGastos (Fecha CHAR(10), Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2))
	CREATE TABLE #TempGastosFinal (Fecha CHAR(10), Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2))

	CREATE TABLE #TempClientePagos (Fecha CHAR(10), Facturado DECIMAL(18,2))	

	IF((SELECT TOP 1 DIA FROM CAJA_MENOR WHERE ID_EMPRESA = @IdEmpresa ORDER BY ID_REGISTRO DESC) IS NULL) BEGIN
		SET @Distribucion = 'MENSUAL'
	END
	ELSE BEGIN
		SET @Distribucion = 'DIARIA'
	END

	;WITH cte AS (
		SELECT @StartDate AS myDate
		UNION ALL
		SELECT DATEADD(day, 1, myDate) AS myDate
		FROM cte
		WHERE DATEADD(day, 1, myDate) <= @EndDate
	)
	INSERT INTO #TempMovimientos (Fecha)
	SELECT CONVERT(varchar(10),CONVERT(date,myDate,106),103) AS Fecha
	FROM cte
	OPTION (MAXRECURSION 0)

	INSERT INTO #TempGastos (Fecha, Compras, Nomina, Prestamos, Servicios, Varios)
	SELECT 
		CONVERT(varchar(10),CONVERT(date,FECHA,106),103), 
		CASE WHEN (TIPO_GASTO = 'COMPRAS') THEN VALOR END AS Compras, 
		CASE WHEN (TIPO_GASTO = 'NOMINA') THEN VALOR END AS Nomina,
		CASE WHEN (TIPO_GASTO = 'PRESTAMOS') THEN VALOR END AS Prestamos,
		CASE WHEN (TIPO_GASTO = 'SERVICIOS') THEN VALOR END AS Servicios,
		CASE WHEN (TIPO_GASTO = 'VARIOS') THEN VALOR END AS Varios
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta	

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
		CONVERT(varchar(10),CONVERT(date,FECHA,106),103),
		SUM(TOTAL)
	FROM CLIENTE_PAGOS
	WHERE ID_EMPRESA = @IdEmpresa AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta
	GROUP BY Fecha

	UPDATE Movimientos
	SET Compras = Gastos.Compras,
		Nomina = Gastos.Nomina,
		Prestamos = Gastos.Prestamos,
		Servicios = Gastos.Servicios,
		Varios = Gastos.Varios		
	FROM #TempMovimientos Movimientos
	INNER JOIN #TempGastosFinal Gastos ON Movimientos.Fecha = Gastos.Fecha	

	UPDATE Movimientos
	SET Facturado = ClientePagos.Facturado
	FROM #TempMovimientos Movimientos	
	INNER JOIN #TempClientePagos ClientePagos ON Movimientos.Fecha = ClientePagos.Fecha

	IF(@Distribucion = 'MENSUAL') BEGIN
		UPDATE Movimientos
		SET Acumulado = CAJA_MENOR.ACUMULADO,
		Saldo_Inicial = CAJA_MENOR.SALDO_INICIAL
		FROM #TempMovimientos Movimientos
		INNER JOIN CAJA_MENOR ON YEAR(CAJA_MENOR.FECHA_REGISTRO) = YEAR(Movimientos.Fecha) AND MONTH(CAJA_MENOR.FECHA_REGISTRO) = MONTH(Movimientos.Fecha) AND ID_EMPRESA = @IdEmpresa		
	END
	ELSE BEGIN

		UPDATE Movimientos
		SET Acumulado = CAJA_MENOR.ACUMULADO,
		Saldo_Inicial = CAJA_MENOR.SALDO_INICIAL
		FROM #TempMovimientos Movimientos
		INNER JOIN CAJA_MENOR ON YEAR(CAJA_MENOR.FECHA_REGISTRO) = YEAR(Movimientos.Fecha) AND MONTH(CAJA_MENOR.FECHA_REGISTRO) = MONTH(Movimientos.Fecha) AND DAY(CAJA_MENOR.FECHA_REGISTRO) = DAY(Movimientos.Fecha) AND ID_EMPRESA = @IdEmpresa
	END
	
	DELETE FROM #TempMovimientos WHERE (ISNULL(Compras, 0) + ISNULL(Nomina, 0) + ISNULL(Prestamos, 0) + ISNULL(Servicios, 0) + ISNULL(Varios, 0) + ISNULL(Facturado, 0)) = 0

	SELECT 
		ISNULL(Saldo_Inicial, 0) AS Saldo_Inicial, 
		ISNULL(Acumulado, 0) AS Acumulado, 
		RTRIM(Fecha) AS Fecha, 
		ISNULL(Compras, 0) AS Compras, 
		ISNULL(Nomina, 0) AS Nomina, 
		ISNULL(Prestamos, 0) AS Prestamos, 
		ISNULL(Servicios, 0) AS Servicios, 
		ISNULL(Varios, 0) AS Varios, 
		ISNULL(Facturado, 0) AS Facturado
	FROM #TempMovimientos
	ORDER BY Fecha DESC	

	IF OBJECT_ID('tempdb..#TempGastos') IS NOT NULL DROP TABLE #TempGastos
	IF OBJECT_ID('tempdb..#TempGastosFinal') IS NOT NULL DROP TABLE #TempGastosFinal
	IF OBJECT_ID('tempdb..#TempClientePagos') IS NOT NULL DROP TABLE #TempClientePagos	
	IF OBJECT_ID('tempdb..#TempMovimientos') IS NOT NULL DROP TABLE #TempMovimientos

END

GO