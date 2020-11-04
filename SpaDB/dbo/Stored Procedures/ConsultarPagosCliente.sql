CREATE PROCEDURE ConsultarPagosCliente(
	@JsonPagos NVARCHAR(MAX)
)
AS
BEGIN

	DECLARE @IdCliente INT	
	DECLARE @FechaDesde DATE
	DECLARE @FechaHasta DATE
	DECLARE @IdEmpresa VARCHAR(36)	

	DECLARE @statement NVARCHAR(MAX) = N'';

	CREATE TABLE #TempBusquedaPagos (Id_Cliente INT, Fecha_Desde DATETIME, Fecha_Hasta DATETIME, Id_Empresa UNIQUEIDENTIFIER)

	INSERT INTO #TempBusquedaPagos (Id_Cliente, Fecha_Desde, Fecha_Hasta, Id_Empresa)
	SELECT
		Id_Cliente, Fecha_Desde, Fecha_Hasta, Id_Empresa
	FROM
		OPENJSON(@JsonPagos)
	WITH (
		Id_Cliente INT '$.Id_Cliente', Fecha_Desde DATETIME '$.Fecha_Desde',
		Fecha_Hasta DATETIME '$.Fecha_Hasta', Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa'		
	)		
	
	SET @IdCliente = (SELECT TOP 1 Id_Cliente FROM #TempBusquedaPagos)	
	SET @FechaDesde = (SELECT TOP 1 CAST(Fecha_Desde AS DATE) FROM #TempBusquedaPagos)
	SET @FechaHasta = (SELECT TOP 1 CAST(Fecha_Hasta AS DATE) FROM #TempBusquedaPagos)
	SET @IdEmpresa = (SELECT TOP 1 Id_Empresa FROM #TempBusquedaPagos)	


	SET @statement = @statement + N' 
	SELECT ID_CLIENTEPAGO,
		CLIENTE_PAGOS.ID_CLIENTE,
		CONCAT(RTRIM(LEFT(CLIENTES.NOMBRES,(PATINDEX(''% %'',CLIENTES.NOMBRES)))),'' '' ,RTRIM(LEFT(CLIENTES.APELLIDOS,(PATINDEX(''% %'',CLIENTES.APELLIDOS))))) AS NOMBREAPELLIDO_CLIENTE,
		FECHA,
		SUBTOTAL,
		DESCUENTO,
		TOTAL,
		CLIENTE_PAGOS.ID_EMPRESA
	FROM CLIENTE_PAGOS
		INNER JOIN CLIENTES ON CLIENTES.ID_CLIENTE = CLIENTE_PAGOS.ID_CLIENTE		
	WHERE (CONVERT(VARCHAR(10),FECHA,120) BETWEEN @FechaDesde AND @FechaHasta) AND CLIENTE_PAGOS.ID_EMPRESA = @IdEmpresa'	

	IF @IdCliente <> -1 BEGIN
		SET @statement = @statement + N' AND CLIENTE_PAGOS.ID_CLIENTE = @IdCliente'
	END
	

	SET @statement = @statement + N' ORDER BY FECHA DESC'

	EXECUTE sp_executesql @statement,
	N'@FechaDesde DATE, @FechaHasta DATE, @IdEmpresa VARCHAR(36), @IdCliente INT',
	@FechaDesde, @FechaHasta, @IdEmpresa, @IdCliente


	IF OBJECT_ID('tempdb..#TempBusquedaPagos') IS NOT NULL DROP TABLE #TempBusquedaPagos	
END

GO