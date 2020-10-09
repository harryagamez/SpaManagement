CREATE PROCEDURE RegistrarFacturacionServicios(@JsonAplicacionPago NVARCHAR(MAX))
AS
BEGIN

SET XACT_ABORT, NOCOUNT ON

DECLARE @Fecha AS DATE
DECLARE @IdEmpresa AS VARCHAR(36)
DECLARE @Mensaje AS VARCHAR(200)
DECLARE @Anio INT
DECLARE @Mes INT
DECLARE @Dia AS INT
DECLARE @Total AS REAL

CREATE TABLE #TempAgenda (Id_Agenda INT, Estado CHAR(12), Id_Empresa VARCHAR(36))
CREATE TABLE #TempTransacciones (Fecha DATETIME, Id_Producto INT, Cantidad INT, Id_TipoTransaccion INT, Id_EmpleadoCliente INT, Id_Empresa VARCHAR(36))
CREATE TABLE #TempClientePagos (Id_Cliente INT, Fecha DATETIME, SubTotal REAL, Descuento REAL, Total REAL, Id_Empresa VARCHAR(36))
CREATE TABLE #TempCajaMenor (Id_Registro INT, Anio INT, Mes INT, Dia SMALLDATETIME, Quincena INT, Saldo_Inicial REAL, Acumulado REAL, Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Id_Empresa VARCHAR(36))

INSERT INTO #TempAgenda(Id_Agenda, Estado, Id_Empresa)
	SELECT 
		JsonAgendas.*
	FROM 
		OPENJSON(@JsonAplicacionPago, '$')
	WITH (
		Agendas NVARCHAR(MAX) '$.Agendas' AS JSON		
	) AS JsonAplicacionPago
	CROSS APPLY OPENJSON(JsonAplicacionPago.Agendas)
	WITH(
		Id_Agenda INT '$.Id_Agenda',
		Estado CHAR(12) '$.Estado',
		Id_Empresa VARCHAR(36) '$.Id_Empresa'
	) JsonAgendas

INSERT INTO #TempTransacciones(Fecha, Id_Producto, Cantidad, Id_TipoTransaccion, Id_EmpleadoCliente, Id_Empresa)
	SELECT
		JsonTransacciones.*
	FROM
		OPENJSON(@JsonAplicacionPago, '$')
	WITH(
		Transacciones NVARCHAR(MAX) '$.Transacciones' AS JSON
	) AS JsonAplicacionPago
	CROSS APPLY OPENJSON(JsonAplicacionPago.Transacciones)
	WITH(		
		Fecha DATETIME '$.Fecha',
		Id_Producto INT '$.Id_Producto',
		Cantidad INT '$.Cantidad',
		Id_TipoTransaccion INT '$.Id_TipoTransaccion',
		Id_EmpleadoCliente INT '$.Id_EmpleadoCliente',		
		Id_Empresa VARCHAR(36) '$.Id_Empresa'
	) JsonTransacciones	

INSERT INTO #TempClientePagos(Id_Cliente, Fecha, SubTotal, Descuento, Total, Id_Empresa)
	SELECT
		JsonClientePago.*
	FROM
		OPENJSON(@JsonAplicacionPago, '$')
	WITH(
		Cliente_Pago NVARCHAR(MAX) '$.Cliente_Pago' AS JSON
	) AS JsonAplicacionPago
	CROSS APPLY OPENJSON(JsonAplicacionPago.Cliente_Pago)
	WITH(		
		Id_Cliente INT '$.Id_Cliente',
		Fecha DATETIME '$.Fecha',
		SubTotal REAL '$.SubTotal',
		Descuento REAL '$.Descuento',
		Total REAL '$.Total',
		Id_Empresa VARCHAR(36) '$.Id_Empresa'		
	) JsonClientePago

	SET @Fecha = (SELECT TOP 1 Fecha FROM #TempClientePagos)
	SET @IdEmpresa = (SELECT TOP 1 Id_Empresa FROM #TempClientePagos)

	INSERT INTO #TempCajaMenor SELECT TOP 1 * FROM CAJA_MENOR WHERE ID_EMPRESA = @IdEmpresa ORDER BY ID_REGISTRO DESC

	SELECT TOP 1 @Anio = Anio FROM #TempCajaMenor
	SELECT TOP 1 @Mes = Mes FROM #TempCajaMenor
	SELECT TOP 1 @Dia = DAY(Dia) FROM #TempCajaMenor
	SELECT TOP 1 @Total = Total FROM #TempClientePagos

	IF (SELECT COUNT(*) FROM #TempCajaMenor) = 0 BEGIN
		SET @Mensaje = 'Nunca ha configurado la caja menor'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END
	
	IF (@Dia IS NULL) BEGIN
		IF(@Anio <> YEAR(GETDATE()) OR @Mes <> MONTH(GETDATE())) BEGIN
			SET @Mensaje = 'La configuración de caja menor mensual no está actualizada'
			RAISERROR (@Mensaje, 16, 1)		
			RETURN
		END		
	END
	ELSE
	IF(@Dia <> DAY(GETDATE()) OR @Mes <> MONTH(GETDATE()) OR @Anio <> YEAR(GETDATE()) ) BEGIN
		SET @Mensaje = 'La configuración de caja menor diaria no está actualizada'
			RAISERROR (@Mensaje, 16, 1)		
			RETURN
	END	

	BEGIN TRY

	BEGIN TRANSACTION Tn_FacturacionServicios

		MERGE AGENDA AS TARGET
		USING  #TempAgenda AS SOURCE
		ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_AGENDA = SOURCE.Id_Agenda
		WHEN MATCHED THEN
			UPDATE SET TARGET.ESTADO = SOURCE.Estado;

		INSERT INTO TRANSACCIONES (FECHA, ID_PRODUCTO, CANTIDAD, ID_TIPOTRANSACCION, ID_EMPLEADOCLIENTE, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA) SELECT Fecha, Id_Producto, Cantidad, Id_TipoTransaccion, Id_EmpleadoCliente, GETDATE(), GETDATE(), Id_Empresa FROM #TempTransacciones
		
		MERGE PRODUCTOS AS TARGET
		USING #TempTransacciones AS SOURCE
		ON TARGET.ID_PRODUCTO = SOURCE.Id_Producto AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa
		WHEN MATCHED THEN
			UPDATE SET INVENTARIO = (INVENTARIO - SOURCE.Cantidad);
		
		MERGE CLIENTE_PAGOS AS TARGET
		USING #TempClientePagos AS SOURCE
		ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_CLIENTE = SOURCE.Id_Cliente AND CAST(TARGET.FECHA AS DATE) = CAST(SOURCE.Fecha AS DATE)
		WHEN MATCHED THEN
			UPDATE SET SUBTOTAL = (TARGET.SUBTOTAL + SOURCE.SubTotal), DESCUENTO = (TARGET.DESCUENTO + SOURCE.Descuento), TOTAL = (TARGET.TOTAL + SOURCE.Total)
		WHEN NOT MATCHED THEN
			INSERT (ID_CLIENTE, FECHA, SUBTOTAL, DESCUENTO, TOTAL, ID_EMPRESA)
			VALUES (SOURCE.Id_Cliente, SOURCE.Fecha, SOURCE.SubTotal, SOURCE.Descuento, SOURCE.Total, SOURCE.Id_Empresa);

		MERGE CAJA_MENOR AS TARGET
		USING #TempCajaMenor AS SOURCE
		ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_REGISTRO = SOURCE.Id_Registro
		WHEN MATCHED THEN
			UPDATE SET ACUMULADO = (TARGET.ACUMULADO + @Total), FECHA_MODIFICACION = GETDATE();
		

	COMMIT TRANSACTION Tn_FacturacionServicios

	IF OBJECT_ID('tempdb..#TempAgenda') IS NOT NULL DROP TABLE #TempAgenda
	IF OBJECT_ID('tempdb..#TempTransacciones') IS NOT NULL DROP TABLE #TempTransacciones
	IF OBJECT_ID('tempdb..#TempClientePagos') IS NOT NULL DROP TABLE #TempClientePagos
	IF OBJECT_ID('tempdb..#TempCajaMenor') IS NOT NULL DROP TABLE #TempCajaMenor

	END TRY
	BEGIN CATCH	
		
		IF OBJECT_ID('tempdb..#TempAgenda') IS NOT NULL DROP TABLE #TempAgenda
		IF OBJECT_ID('tempdb..#TempTransacciones') IS NOT NULL DROP TABLE #TempTransacciones
		IF OBJECT_ID('tempdb..#TempClientePagos') IS NOT NULL DROP TABLE #TempClientePagos
		IF OBJECT_ID('tempdb..#TempCajaMenor') IS NOT NULL DROP TABLE #TempCajaMenor
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_FacturacionServicios	
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)	
		
	END CATCH

END
GO