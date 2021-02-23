CREATE PROCEDURE [dbo].[EliminarEmpleadoInsumo](
	@JsonTransaccion NVARCHAR(MAX)
)
AS
BEGIN	

	DECLARE @FechaActual DATETIME = GETDATE()
	CREATE TABLE #TransaccionInsumo (Id_Transaccion INT, Id_Producto INT, Cantidad INT, Id_Empleado INT, Id_Empresa VARCHAR(36))

	INSERT INTO #TransaccionInsumo (Id_Transaccion, Id_Producto, Cantidad, Id_Empleado, Id_Empresa)
		SELECT 
		TransaccionInsumo.Id_Transaccion,
		TransaccionInsumo.Id_Producto,
		TransaccionInsumo.Cantidad,
		TransaccionInsumo.Id_Empleado,
		TransaccionInsumo.Id_Empresa
	FROM 
		OPENJSON(@JsonTransaccion)
	WITH (
		Id_Transaccion INT '$.Id_Transaccion',	
		Id_Producto INT '$.Id_Producto',	
		Cantidad INT '$.Cantidad',	
		Id_Empleado INT '$.Id_Empleado',	
		Id_Empresa VARCHAR(36) '$.Id_Empresa'
	) AS TransaccionInsumo

	BEGIN TRY

		BEGIN TRANSACTION Tn_EliminarInsumo

			DELETE 
				Transaccion
			FROM TRANSACCIONES Transaccion
			INNER JOIN #TransaccionInsumo
			ON Transaccion.ID_TRANSACCION = #TransaccionInsumo.Id_Transaccion
			AND Transaccion.ID_PRODUCTO = #TransaccionInsumo.Id_Producto
			AND Transaccion.ID_EMPLEADO = #TransaccionInsumo.Id_Empleado
			AND Transaccion.ID_EMPRESA = #TransaccionInsumo.Id_Empresa

			UPDATE PRODUCTOS 
				SET INVENTARIO = INVENTARIO + #TransaccionInsumo.Cantidad,
					FECHA_MODIFICACION = @FechaActual
			FROM PRODUCTOS 
			INNER JOIN #TransaccionInsumo
			ON PRODUCTOS.ID_PRODUCTO = #TransaccionInsumo.Id_Producto
			AND PRODUCTOS.ID_EMPRESA = #TransaccionInsumo.Id_Empresa

		COMMIT TRANSACTION Tn_EliminarInsumo

		IF OBJECT_ID('tempdb..#TransaccionInsumo') IS NOT NULL DROP TABLE #TransaccionInsumo

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TransaccionInsumo') IS NOT NULL DROP TABLE #TransaccionInsumo
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_EliminarInsumo	
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)	

	END CATCH

END

GO