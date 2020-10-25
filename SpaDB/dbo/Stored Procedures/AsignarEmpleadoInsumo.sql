CREATE PROCEDURE AsignarEmpleadoInsumo(
	@JsonEmpleadoInsumo NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON

	CREATE TABLE #TempEmpleadoInsumo(Id_Transaccion INT, Id_Producto INT, Id_EmpleadoCliente INT, Id_TipoTransaccion INT, Cantidad INT, Id_Empresa VARCHAR(36))
	DECLARE @CantidadInsumo INT
	DECLARE @IdProducto INT

	INSERT INTO #TempEmpleadoInsumo (Id_Transaccion, Id_Producto, Id_EmpleadoCliente, Id_TipoTransaccion, Cantidad, Id_Empresa)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Transaccion') AS Id_Transaccion,
		JSON_VALUE (C.value, '$.Id_Producto') AS Id_Producto, 
		JSON_VALUE (C.value, '$.Id_EmpleadoCliente') AS Id_EmpleadoCliente,
		JSON_VALUE (C.value, '$.Id_TipoTransaccion') AS Id_TipoTransaccion,
		JSON_VALUE (C.value, '$.Cantidad') AS Cantidad,
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa
	FROM OPENJSON(@JsonEmpleadoInsumo) AS C	

	SELECT TOP 1 @CantidadInsumo = Cantidad, @IdProducto = Id_Producto FROM #TempEmpleadoInsumo

	BEGIN TRY

		BEGIN TRANSACTION Tn_AsignarInsumo

			INSERT INTO TRANSACCIONES (ID_PRODUCTO, ID_EMPLEADOCLIENTE, ID_TIPOTRANSACCION, CANTIDAD, ID_EMPRESA, FECHA, FECHA_REGISTRO, FECHA_MODIFICACION ) 
			SELECT 
				Id_Producto, Id_EmpleadoCliente, Id_TipoTransaccion, 
				Cantidad, Id_Empresa, GETDATE(), GETDATE(), GETDATE() 
			FROM #TempEmpleadoInsumo	
	
			UPDATE PRODUCTOS 
				SET INVENTARIO = INVENTARIO - @CantidadInsumo
			WHERE ID_PRODUCTO = @IdProducto

		COMMIT TRANSACTION Tn_AsignarInsumo

		IF OBJECT_ID('tempdb..#TempEmpleadoInsumo') IS NOT NULL DROP TABLE #TempEmpleadoInsumo

	END TRY
	BEGIN CATCH	
		
		IF OBJECT_ID('tempdb..#TempEmpleadoInsumo') IS NOT NULL DROP TABLE #TempEmpleadoInsumo
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_AsignarInsumo	
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)	
		
	END CATCH

END

GO