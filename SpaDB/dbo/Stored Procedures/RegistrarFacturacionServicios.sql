CREATE PROCEDURE [dbo].[RegistrarFacturacionServicios] (
	@JsonAplicacionPago NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	DECLARE @Fecha AS DATE
	DECLARE @IdEmpresa AS VARCHAR(36)
	DECLARE @Mensaje AS VARCHAR(200)
	DECLARE @Anio INT
	DECLARE @Mes INT
	DECLARE @Dia AS INT
	DECLARE @TotalPagado AS REAL
	DECLARE @FechaActual AS DATETIME

	SET @FechaActual = GETDATE()

	CREATE TABLE #TempAgenda (Id_Agenda INT, Estado CHAR(12), Id_Empresa VARCHAR(36))

	CREATE TABLE #TempTransacciones (Fecha DATETIME, Id_Producto INT, Cantidad INT, Id_TipoTransaccion INT, Id_EmpleadoCliente INT, Id_Empresa VARCHAR(36))

	CREATE TABLE #TempClientePagos (Id_Cliente INT, Fecha DATETIME, Total_Servicios DECIMAL(18,2), Total_Promocion DECIMAL(18,2), Total_Servicios_NoPromocion DECIMAL(18,2), 
	Total_Productos DECIMAL(18,2), Descuento DECIMAL(18,2), Total_Pagado DECIMAL(18,2), Id_Empresa VARCHAR(36), Usuario_Creacion VARCHAR(25))

	CREATE TABLE #TempCajaMenor (Id_Registro INT, Anio INT, Mes INT, Dia SMALLDATETIME, Quincena INT, Saldo_Inicial DECIMAL(18,2), Acumulado DECIMAL(18,2), Fecha_Registro DATETIME, 
	Fecha_Modificacion DATETIME, Id_Empresa VARCHAR(36))

	INSERT INTO #TempAgenda(Id_Agenda, Estado, Id_Empresa)
	SELECT 
		Agenda.Id_Agenda,
		Agenda.Estado,
		Agenda.Id_Empresa
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
	) Agenda

	INSERT INTO #TempTransacciones(Fecha, Id_Producto, Cantidad, Id_TipoTransaccion, Id_EmpleadoCliente, Id_Empresa)
	SELECT
		Transaccion.Fecha,
		Transaccion.Id_Producto,
		Transaccion.Cantidad,
		Transaccion.Id_TipoTransaccion,
		Transaccion.Id_EmpleadoCliente,
		Transaccion.Id_Empresa
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
	) Transaccion	

	INSERT INTO #TempClientePagos(Id_Cliente, Fecha, Total_Servicios, Total_Promocion, Total_Servicios_NoPromocion, 
	Total_Productos, Descuento, Total_Pagado, Id_Empresa, Usuario_Creacion)
	SELECT
		PagoCliente.Id_Cliente,
		PagoCliente.Fecha,
		PagoCliente.Total_Servicios,
		PagoCliente.Total_Promocion,
		PagoCliente.Total_Servicios_NoPromocion,
		PagoCliente.Total_Productos,
		PagoCliente.Descuento,
		PagoCliente.Total_Pagado,
		PagoCliente.Id_Empresa,
		PagoCliente.Usuario_Creacion
	FROM
		OPENJSON(@JsonAplicacionPago, '$')
	WITH(
		Cliente_Pago NVARCHAR(MAX) '$.Cliente_Pago' AS JSON
	) AS JsonAplicacionPago
	CROSS APPLY OPENJSON(JsonAplicacionPago.Cliente_Pago)
	WITH(		
		Id_Cliente INT '$.Id_Cliente',
		Fecha DATETIME '$.Fecha',
		Total_Servicios DECIMAL(18,2) '$.Total_Servicios',
		Total_Promocion DECIMAL(18,2) '$.Total_Promocion',
		Total_Servicios_NoPromocion DECIMAL(18,2) '$.Total_Servicios_NoPromocion',
		Total_Productos DECIMAL(18,2) '$.Total_Productos',
		Descuento DECIMAL(18,2) '$.Descuento',
		Total_Pagado DECIMAL(18,2) '$.Total_Pagado',
		Id_Empresa VARCHAR(36) '$.Id_Empresa',
		Usuario_Creacion VARCHAR(25) '$.Usuario_Creacion'
	) PagoCliente

	SET @Fecha = (SELECT TOP 1 Fecha FROM #TempClientePagos)
	SET @IdEmpresa = (SELECT TOP 1 Id_Empresa FROM #TempClientePagos)

	INSERT INTO #TempCajaMenor 
	SELECT 
		TOP 1 * 
	FROM CAJA_MENOR 
	WHERE ID_EMPRESA = @IdEmpresa 
	ORDER BY ID_REGISTRO DESC

	SELECT TOP 1 @Anio = Anio FROM #TempCajaMenor
	SELECT TOP 1 @Mes = Mes FROM #TempCajaMenor
	SELECT TOP 1 @Dia = DAY(Dia) FROM #TempCajaMenor
	SELECT TOP 1 @TotalPagado = Total_Pagado FROM #TempClientePagos

	IF (SELECT COUNT(*) FROM #TempCajaMenor) = 0 BEGIN

		SET @Mensaje = 'Para poder realizar una transacción debe configurar la caja'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN

	END
	
	IF (@Dia IS NULL) BEGIN

		IF(@Anio <> YEAR(@FechaActual) OR @Mes <> MONTH(@FechaActual)) BEGIN
			SET @Mensaje = 'La configuración de caja mensual no está actualizada'
			RAISERROR (@Mensaje, 16, 1)		
			RETURN
		END	
		
	END
	ELSE BEGIN

		IF(@Dia <> DAY(@FechaActual) OR @Mes <> MONTH(@FechaActual) OR @Anio <> YEAR(@FechaActual)) BEGIN
			SET @Mensaje = 'La configuración de caja diaria no está actualizada'
			RAISERROR (@Mensaje, 16, 1)		
			RETURN
		END	

	END
	
	BEGIN TRY

		BEGIN TRANSACTION Tn_FacturacionServicios

			MERGE AGENDA AS TARGET
			USING  #TempAgenda AS SOURCE
			ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
			AND TARGET.ID_AGENDA = SOURCE.Id_Agenda
			WHEN MATCHED THEN
				UPDATE SET 
					TARGET.ESTADO = SOURCE.Estado;

			INSERT INTO TRANSACCIONES (FECHA, ID_PRODUCTO, CANTIDAD, ID_TIPOTRANSACCION, ID_EMPLEADOCLIENTE, FECHA_REGISTRO, 
			FECHA_MODIFICACION, ID_EMPRESA) 
			SELECT 
				Fecha, Id_Producto, Cantidad, Id_TipoTransaccion, 
				Id_EmpleadoCliente, @FechaActual, @FechaActual, Id_Empresa 
			FROM #TempTransacciones
		
			MERGE PRODUCTOS AS TARGET
			USING #TempTransacciones AS SOURCE
			ON TARGET.ID_PRODUCTO = SOURCE.Id_Producto AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa
			WHEN MATCHED THEN
				UPDATE SET INVENTARIO = (INVENTARIO - SOURCE.Cantidad);
		
			MERGE CLIENTE_PAGOS AS TARGET
			USING #TempClientePagos AS SOURCE
			ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
			AND TARGET.ID_CLIENTE = SOURCE.Id_Cliente 
			AND CAST(TARGET.FECHA AS DATE) = CAST(SOURCE.Fecha AS DATE)
			WHEN MATCHED THEN
				UPDATE SET 
					TOTAL_SERVICIOS = (TARGET.TOTAL_SERVICIOS + SOURCE.Total_Servicios), 
					TOTAL_PROMOCION = (TARGET.TOTAL_PROMOCION + SOURCE.Total_Promocion), 
					TOTAL_SERVICIOS_NOPROMOCION = (TARGET.TOTAL_SERVICIOS_NOPROMOCION + SOURCE.Total_Servicios_NoPromocion), 
					TOTAL_PRODUCTOS = (TARGET.TOTAL_PRODUCTOS + SOURCE.Total_Productos),
					DESCUENTO = (TARGET.DESCUENTO + SOURCE.Descuento), 
					TOTAL_PAGADO = (TARGET.TOTAL_PAGADO + SOURCE.Total_Pagado),
					USUARIO_MODIFICACION = SOURCE.Usuario_Creacion
			WHEN NOT MATCHED THEN
				INSERT (ID_CLIENTEPAGO, ID_CLIENTE, FECHA, TOTAL_SERVICIOS, TOTAL_PROMOCION, TOTAL_SERVICIOS_NOPROMOCION, TOTAL_PRODUCTOS,
				DESCUENTO, TOTAL_PAGADO, ID_EMPRESA, USUARIO_CREACION)
				VALUES (NEWID(), SOURCE.Id_Cliente, SOURCE.Fecha, SOURCE.Total_Servicios, SOURCE.Total_Promocion, SOURCE.Total_Servicios_NoPromocion, 
				SOURCE.Total_Productos, SOURCE.Descuento, SOURCE.Total_Pagado, SOURCE.Id_Empresa, SOURCE.Usuario_Creacion);

			MERGE CAJA_MENOR AS TARGET
			USING #TempCajaMenor AS SOURCE
			ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
			AND TARGET.ID_REGISTRO = SOURCE.Id_Registro
			WHEN MATCHED THEN
				UPDATE SET 
					ACUMULADO = (TARGET.ACUMULADO + @TotalPagado), 
					FECHA_MODIFICACION = @FechaActual;
		
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