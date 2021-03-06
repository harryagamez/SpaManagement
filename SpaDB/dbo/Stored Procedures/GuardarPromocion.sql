CREATE PROCEDURE [dbo].[GuardarPromocion](
	@JsonPromocion NVARCHAR(MAX)
)
AS
SET ANSI_WARNINGS OFF
BEGIN	
	
	DECLARE @HasChanged BIT
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @IdPromocion UNIQUEIDENTIFIER = NEWID()	
	DECLARE @Mensaje CHAR(200)
	DECLARE @PromocionesIguales INT

	CREATE TABLE #TempPromociones (Id_Promocion VARCHAR(36), Id_Tipo_Promocion VARCHAR(36), 
	Descripcion VARCHAR(200), Valor DECIMAL(18,2), Estado CHAR(10), Id_Empresa UNIQUEIDENTIFIER, Usuario_Creacion CHAR(25), Usuario_Modificacion CHAR(25))

	CREATE TABLE #TempDetallePromociones (Id_Detalle_Promocion VARCHAR(36), Id_Promocion VARCHAR(36), Id_Empresa_Servicio VARCHAR(36))

	CREATE TABLE #Busqueda (Id_Promocion VARCHAR(36), EqualCount INT, TotalCount INT)
	 
	SELECT 
		@HasChanged = Has_Changed
	FROM 
		OPENJSON(@JsonPromocion)
	WITH (
		Has_Changed BIT '$.Has_Changed'
	)

	INSERT INTO #TempPromociones (Id_Promocion, Id_Tipo_Promocion, Descripcion, Valor, Estado, Id_Empresa, Usuario_Creacion, Usuario_Modificacion)
	SELECT 
		Id_Promocion, Id_Tipo_Promocion, Descripcion, Valor, Estado, Id_Empresa, Usuario_Creacion, Usuario_Modificacion
	FROM 
		OPENJSON(@JsonPromocion)
	WITH (
		Id_Promocion VARCHAR(36) '$.Id_Promocion', 
		Id_Tipo_Promocion VARCHAR(36) '$.Id_Tipo_Promocion',
		Descripcion VARCHAR(200) '$.Descripcion',
		Valor DECIMAL(18,2) '$.Valor',
		Estado CHAR(10) '$.Estado',
		Id_Empresa VARCHAR(36) '$.Id_Empresa',
		Usuario_Creacion CHAR(25) '$.Usuario_Creacion',
		Usuario_Modificacion CHAR(25) '$.Usuario_Modificacion'
	)

	INSERT INTO #TempDetallePromociones (Id_Detalle_Promocion, Id_Promocion, Id_Empresa_Servicio)
	SELECT
		DetallesPromocion.Id_Detalle_Promocion,
		DetallesPromocion.Id_Promocion,
		DetallesPromocion.Id_Empresa_Servicio			
	FROM
		OPENJSON(@JsonPromocion, '$')
	WITH (
		Detalles_Promocion NVARCHAR(MAX) '$.Detalles_Promocion' AS JSON
	) AS JsonPromocion
	CROSS APPLY OPENJSON(JsonPromocion.Detalles_Promocion)
	WITH (
		Id_Detalle_Promocion VARCHAR(36) '$.Id_Detalle_Promocion',
		Id_Promocion VARCHAR(36) '$.Id_Promocion',
		Id_Empresa_Servicio VARCHAR(36) '$.Id_Empresa_Servicio'
	) DetallesPromocion	

	IF(@HasChanged = 1) BEGIN
		SET @IdPromocion = (SELECT TOP 1 Id_Promocion FROM #TempPromociones)		
	END

	DECLARE @NoRegistros INT = (SELECT COUNT(*) FROM #TempDetallePromociones)

	INSERT INTO #Busqueda (Id_Promocion, EqualCount, TotalCount)
	SELECT 
		DetallePromociones.ID_PROMOCION,
		COUNT (CASE WHEN TempDetallePromociones.Id_Empresa_Servicio = DetallePromociones.ID_EMPRESA_SERVICIO THEN 1 ELSE NULL END) equalcount,
		COUNT (DetallePromociones.ID_DETALLE_PROMOCION) totalcount
	FROM #TempDetallePromociones TempDetallePromociones
	RIGHT JOIN DETALLE_PROMOCIONES DetallePromociones
		ON TempDetallePromociones.Id_Empresa_Servicio = DetallePromociones.ID_EMPRESA_SERVICIO
		AND TempDetallePromociones.Id_Detalle_Promocion <> DetallePromociones.ID_DETALLE_PROMOCION
	WHERE
		DetallePromociones.ID_PROMOCION <> @IdPromocion
	GROUP BY
		DetallePromociones.ID_PROMOCION	
	HAVING 
		COUNT(CASE WHEN TempDetallePromociones.Id_Empresa_Servicio = DetallePromociones.ID_EMPRESA_SERVICIO THEN 1 ELSE NULL END) = COUNT(TempDetallePromociones.Id_Detalle_Promocion)

	DELETE Busqueda
	FROM #Busqueda Busqueda
	INNER JOIN PROMOCIONES 
	ON Busqueda.Id_Promocion = PROMOCIONES.ID_PROMOCION
	WHERE (TotalCount > @NoRegistros) OR (TotalCount < @NoRegistros) 
	OR (EqualCount <> @NoRegistros)	OR (PROMOCIONES.ESTADO = 'INACTIVA')	
	
	DECLARE @BusquedaFinal INT = (SELECT COUNT(Id_Promocion) FROM #Busqueda)
	DECLARE @PromoRepetida CHAR(200) = (SELECT TOP 1 PROMOCIONES.DESCRIPCION FROM #Busqueda INNER JOIN PROMOCIONES ON #Busqueda.Id_Promocion = PROMOCIONES.ID_PROMOCION)

	SET @PromoRepetida = REPLACE(@PromoRepetida, '%','%%')

	IF(@BusquedaFinal > 0) BEGIN
		SET @Mensaje  = 'No se pudo registrar/actualizar la promoción porque la promoción resultante es identica a la promoción ' + @PromoRepetida		
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END	

	MERGE PROMOCIONES AS TARGET
	USING #TempPromociones AS SOURCE
	ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
	AND TARGET.ID_PROMOCION = SOURCE.Id_Promocion
	WHEN MATCHED THEN
		UPDATE SET 
			TARGET.ID_TIPO_PROMOCION = SOURCE.Id_Tipo_Promocion, 
			TARGET.DESCRIPCION = SOURCE.Descripcion, 
			TARGET.VALOR = SOURCE.Valor, 
			TARGET.ESTADO = SOURCE.Estado, 
			TARGET.FECHA_MODIFICACION = @FechaActual, 
			TARGET.USUARIO_MODIFICACION = SOURCE.Usuario_Modificacion
	WHEN NOT MATCHED THEN
		INSERT (ID_PROMOCION, ID_TIPO_PROMOCION, DESCRIPCION, VALOR, ESTADO, ID_EMPRESA, FECHA_CREACION, USUARIO_CREACION)
		VALUES (@IdPromocion , SOURCE.Id_Tipo_Promocion, SOURCE.Descripcion, SOURCE.Valor, SOURCE.Estado, 
		SOURCE.Id_Empresa, @FechaActual, SOURCE.Usuario_Creacion);
		
	MERGE DETALLE_PROMOCIONES AS TARGET
	USING #TempDetallePromociones AS SOURCE
	ON TARGET.ID_DETALLE_PROMOCION = SOURCE.Id_Detalle_Promocion 
	AND TARGET.ID_PROMOCION = SOURCE.Id_Promocion
	WHEN NOT MATCHED THEN
		INSERT (ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO)
		VALUES (NEWID(), @IdPromocion, SOURCE.Id_Empresa_Servicio);			
		
	IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
	IF OBJECT_ID('tempdb..#TempDetallePromociones') IS NOT NULL DROP TABLE #TempDetallePromociones
	IF OBJECT_ID('tempdb..#Busqueda') IS NOT NULL DROP TABLE #Busqueda	

END

GO