 ALTER PROCEDURE ConsultarProductos(@IdEmpresa VARCHAR(36))
 AS
  BEGIN

	SELECT ID_PRODUCTO,RTRIM(NOMBRE) AS NOMBRE,RTRIM(DESCRIPCION) AS DESCRIPCION,PRECIO,
	INVENTARIO,FECHA_REGISTRO,FECHA_MODIFICACION,CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA
	FROM PRODUCTOS WHERE ID_EMPRESA = @IdEmpresa

 END

 GO