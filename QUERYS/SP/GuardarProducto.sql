ALTER PROCEDURE GuardarProducto(@JsonProducto NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempProducto(Id_Producto INT, Nombre CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS , Descripcion CHAR(300) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Precio REAL, Inventario INT, Id_Tipo_Transaccion INT, Cantidad_Transaccion INT, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS)

	DECLARE @JsonId_Producto INT
	DECLARE @Id_Producto INT

	INSERT INTO #TempProducto (Id_Producto, Nombre, Descripcion, Precio, Inventario, Id_Tipo_Transaccion, Cantidad_Transaccion, Id_Empresa)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Producto') AS Id_Producto,
		JSON_VALUE (C.value, '$.Nombre') AS Nombre, 
		JSON_VALUE (C.value, '$.Descripcion') AS Descripcion, 
		JSON_VALUE (C.value, '$.Precio') AS Precio,
		JSON_VALUE (C.value, '$.Inventario') AS Inventario,
		JSON_VALUE (C.value, '$.Id_Tipo_Transaccion') AS Id_Tipo_Transaccion,
		JSON_VALUE (C.value, '$.Cantidad_Transaccion') AS Cantidad_Transaccion,	
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa		
	FROM OPENJSON(@JsonProducto) AS C

	SET @JsonId_Producto = (SELECT TOP 1 Id_Producto FROM #TempProducto)

	BEGIN TRY
		
		MERGE PRODUCTOS AS TARGET
		USING #TempProducto AS SOURCE
		ON TARGET.ID_PRODUCTO = SOURCE.Id_Producto AND TARGET.NOMBRE = SOURCE.Nombre AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa		
		WHEN MATCHED THEN
			UPDATE SET TARGET.NOMBRE = UPPER(SOURCE.Nombre), TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.PRECIO = SOURCE.Precio,
			TARGET.INVENTARIO = (TARGET.INVENTARIO + SOURCE.Cantidad_Transaccion), TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (NOMBRE, DESCRIPCION, PRECIO, INVENTARIO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA)
			VALUES (UPPER(SOURCE.Nombre), SOURCE.Descripcion, SOURCE.Precio, SOURCE.Cantidad_Transaccion, GETDATE(), GETDATE(),
			SOURCE.Id_Empresa);	

		IF @JsonId_Producto = -1 BEGIN
			SET @Id_Producto = SCOPE_IDENTITY()
		END
		ELSE BEGIN
			SET @Id_Producto = @JsonId_Producto
		END
			
		INSERT INTO TRANSACCIONES (FECHA,ID_PRODUCTO,CANTIDAD,ID_TIPOTRANSACCION,FECHA_REGISTRO,FECHA_MODIFICACION)
		SELECT GETDATE(),@Id_Producto,Cantidad_Transaccion,Id_Tipo_Transaccion,GETDATE(),GETDATE() FROM #TempProducto
		WHERE Cantidad_Transaccion > 0

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempProducto') IS NOT NULL DROP TABLE #TempProducto
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO