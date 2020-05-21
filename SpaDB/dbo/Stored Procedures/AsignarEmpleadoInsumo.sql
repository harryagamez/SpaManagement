CREATE PROCEDURE AsignarEmpleadoInsumo(@JsonEmpleadoInsumo NVARCHAR(MAX))
AS
CREATE TABLE #TempEmpleadoInsumo(Id_Transaccion INT, Id_Producto INT, Id_EmpleadoCliente INT, Id_TipoTransaccion INT, Cantidad INT)

	INSERT INTO #TempEmpleadoInsumo (Id_Transaccion, Id_Producto, Id_EmpleadoCliente, Id_TipoTransaccion, Cantidad)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Transaccion') AS Id_Transaccion,
		JSON_VALUE (C.value, '$.Id_Producto') AS Id_Producto, 
		JSON_VALUE (C.value, '$.Id_EmpleadoCliente') AS Id_EmpleadoCliente,
		JSON_VALUE (C.value, '$.Id_TipoTransaccion') AS Id_TipoTransaccion,
		JSON_VALUE (C.value, '$.Cantidad') AS Cantidad
	FROM OPENJSON(@JsonEmpleadoInsumo) AS C	
	BEGIN TRY
	BEGIN TRANSACTION Inicio;
		INSERT INTO TRANSACCIONES (ID_PRODUCTO, ID_EMP_CLI, ID_TIPOTRANSACCION, CANTIDAD, FECHA, FECHA_REGISTRO, FECHA_MODIFICACION ) 
		SELECT Id_Producto, Id_EmpleadoCliente, Id_TipoTransaccion, Cantidad, GETDATE(), GETDATE(), GETDATE() 
		FROM #TempEmpleadoInsumo	
	
		UPDATE PRODUCTOS SET INVENTARIO = INVENTARIO - (SELECT Cantidad FROM #TempEmpleadoInsumo)
		WHERE ID_PRODUCTO = (SELECT Id_Producto FROM #TempEmpleadoInsumo)
	COMMIT TRANSACTION
	END TRY
	
	BEGIN CATCH		
		ROLLBACK TRANSACTION Inicio;		
		IF OBJECT_ID('tempdb..#TempEmpleadoInsumo') IS NOT NULL DROP TABLE #TempEmpleadoInsumo
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)		
	END CATCH