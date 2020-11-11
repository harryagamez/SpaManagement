CREATE PROCEDURE ConsultarMovimientosCajaMenor(
	@IdEmpresa VARCHAR(36),
	@FechaDesde CHAR(10),
	@FechaHasta CHAR(10)
)
AS
BEGIN

	DECLARE @Distribucion CHAR(12)

	CREATE TABLE #TempMovimientos (Saldo_Inicial DECIMAL(18,2), Acumulado DECIMAL (18,2), Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))	

	CREATE TABLE #TempCompras (Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))

	CREATE TABLE #TempNomina (Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))

	CREATE TABLE #TempPrestamos (Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))

	CREATE TABLE #TempServicios (Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))

	CREATE TABLE #TempVarios (Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))

	CREATE TABLE #TempFacturado (Fecha DATETIME, Compras DECIMAL(18,2), Nomina DECIMAL(18,2), Prestamos DECIMAL(18,2), Servicios DECIMAL(18,2), Varios DECIMAL(18,2), Facturado DECIMAL(18,2))

	IF((SELECT TOP 1 DIA FROM CAJA_MENOR WHERE ID_EMPRESA = @IdEmpresa ORDER BY ID_REGISTRO DESC) IS NULL) BEGIN
		SET @Distribucion = 'MENSUAL'
	END
	ELSE BEGIN
		SET @Distribucion = 'DIARIA'
	END
	
	INSERT INTO #TempCompras (Fecha, Compras)
	SELECT
		FECHA, VALOR
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa AND TIPO_GASTO = 'COMPRAS' AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta

	INSERT INTO #TempNomina (Fecha, Nomina)
	SELECT
		FECHA, VALOR
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa AND TIPO_GASTO = 'NOMINA' AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta

	INSERT INTO #TempPrestamos (Fecha, Prestamos)
	SELECT
		FECHA, VALOR
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa AND TIPO_GASTO = 'PRESTAMOS' AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta

	INSERT INTO #TempServicios (Fecha, Servicios)
	SELECT
		FECHA, VALOR
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa AND TIPO_GASTO = 'SERVICIOS' AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta

	INSERT INTO #TempVarios (Fecha, Varios)
	SELECT
		FECHA, VALOR
	FROM GASTOS
	WHERE ID_EMPRESA = @IdEmpresa AND TIPO_GASTO = 'VARIOS' AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta

	INSERT INTO #TempFacturado (Fecha, Facturado)
	SELECT
		FECHA, TOTAL
	FROM CLIENTE_PAGOS
	WHERE ID_EMPRESA = @IdEmpresa AND CONVERT(varchar(10),CONVERT(date,FECHA,106),103) BETWEEN @FechaDesde AND @FechaHasta	

	INSERT INTO #TempMovimientos (Fecha, Compras)
	SELECT Fecha, Compras FROM #TempCompras	

	INSERT INTO #TempMovimientos (Fecha, Nomina)
	SELECT Fecha, Nomina FROM #TempNomina

	INSERT INTO #TempMovimientos (Fecha, Prestamos)
	SELECT Fecha, Prestamos FROM #TempPrestamos

	INSERT INTO #TempMovimientos (Fecha, Servicios)
	SELECT Fecha, Servicios FROM #TempServicios

	INSERT INTO #TempMovimientos (Fecha, Varios)
	SELECT Fecha, Varios FROM #TempVarios

	INSERT INTO #TempMovimientos (Fecha, Facturado)
	SELECT Fecha, Facturado FROM #TempFacturado

	IF(@Distribucion = 'MENSUAL') BEGIN
		UPDATE #TempMovimientos
		SET #TempMovimientos.Acumulado = (SELECT TOP 1 ACUMULADO FROM CAJA_MENOR WHERE YEAR(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = YEAR(#TempMovimientos.Fecha) AND MONTH(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = MONTH(#TempMovimientos.Fecha) AND ID_EMPRESA = @IdEmpresa),
		#TempMovimientos.Saldo_Inicial = (SELECT TOP 1 SALDO_INICIAL FROM CAJA_MENOR WHERE YEAR(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = YEAR(#TempMovimientos.Fecha) AND MONTH(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = MONTH(#TempMovimientos.Fecha) AND ID_EMPRESA = @IdEmpresa)
	END
	ELSE BEGIN
		UPDATE #TempMovimientos
		SET #TempMovimientos.Acumulado = (SELECT TOP 1 ACUMULADO FROM CAJA_MENOR WHERE YEAR(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = YEAR(#TempMovimientos.Fecha) AND MONTH(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = MONTH(#TempMovimientos.Fecha) AND DAY(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = DAY(#TempMovimientos.Fecha) AND ID_EMPRESA = @IdEmpresa),
		#TempMovimientos.Saldo_Inicial = (SELECT TOP 1 SALDO_INICIAL FROM CAJA_MENOR WHERE YEAR(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = YEAR(#TempMovimientos.Fecha) AND MONTH(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = MONTH(#TempMovimientos.Fecha) AND DAY(Convert(varchar(10),CONVERT(date,FECHA_REGISTRO,106),103)) = DAY(#TempMovimientos.Fecha) AND ID_EMPRESA = @IdEmpresa)
	END	

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
	

	IF OBJECT_ID('tempdb..#TempCompras') IS NOT NULL DROP TABLE #TempCompras
	IF OBJECT_ID('tempdb..#TempPrestamos') IS NOT NULL DROP TABLE #TempPrestamos
	IF OBJECT_ID('tempdb..#TempServicios') IS NOT NULL DROP TABLE #TempServicios
	IF OBJECT_ID('tempdb..#TempVarios') IS NOT NULL DROP TABLE #TempVarios
	IF OBJECT_ID('tempdb..#TempFacturado') IS NOT NULL DROP TABLE #TempFacturado
	IF OBJECT_ID('tempdb..#TempMovimientos') IS NOT NULL DROP TABLE #TempMovimientos


END

GO