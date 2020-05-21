CREATE PROCEDURE ConsultarEmpleadoInsumos(@IdEmpleado VARCHAR(36))
AS
BEGIN

	SELECT 
		ID_TRANSACCION, FECHA, ID_TIPOTRANSACCION, CANTIDAD, TRANSACCIONES.ID_PRODUCTO,
		ID_EMP_CLI AS ID_EMPLEADOCLIENTE,RTRIM(PRODUCTOS.NOMBRE) AS NOMBRE_PRODUCTO	
	FROM TRANSACCIONES 
	INNER JOIN PRODUCTOS 
	ON PRODUCTOS.ID_PRODUCTO = TRANSACCIONES.ID_PRODUCTO 
	WHERE ID_EMP_CLI = @IdEmpleado ORDER BY PRODUCTOS.NOMBRE ASC

END

GO