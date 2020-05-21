CREATE PROCEDURE EliminarEmpleadoInsumo(@IdTransaccion INT)
AS

BEGIN
	
	SET XACT_ABORT, NOCOUNT ON
	DECLARE @CantidadInsumo INT
	DECLARE @IdProducto INT	
	
	SELECT @CantidadInsumo = CANTIDAD, @IdProducto = ID_PRODUCTO 
	FROM TRANSACCIONES 
	WHERE ID_TRANSACCION = @IdTransaccion

	BEGIN TRY

	BEGIN TRANSACTION Tn_EliminarInsumo

	DELETE 
	FROM TRANSACCIONES 
	WHERE ID_TRANSACCION = @IdTransaccion

	UPDATE PRODUCTOS 
	SET INVENTARIO = INVENTARIO + @CantidadInsumo
	WHERE ID_PRODUCTO = @IdProducto

	COMMIT TRANSACTION

	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_EliminarInsumo
	END CATCH

END

GO