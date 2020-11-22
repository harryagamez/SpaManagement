CREATE PROCEDURE GuardarPromocion (
	@JsonPromocion NVARCHAR(MAX)
)
AS
BEGIN
	
	IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
	IF OBJECT_ID('tempdb..#TempDetallePromociones') IS NOT NULL DROP TABLE #TempDetallePromociones
	IF OBJECT_ID('tempdb..#TempDetallePromocionesExistente') IS NOT NULL DROP TABLE #TempDetallePromocionesExistente
	
	DECLARE @HasChanged BIT
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @IdPromocion UNIQUEIDENTIFIER = NEWID()
	DECLARE @NoFilasTempDetallesPromociones INT	
	DECLARE @Mensaje CHAR(200)

	CREATE TABLE #TempPromociones (Id_Promocion VARCHAR(36), Id_Tipo_Promocion VARCHAR(36), 
	Descripcion VARCHAR(200), Valor DECIMAL(18,2), Estado CHAR(10), Id_Empresa UNIQUEIDENTIFIER, Usuario_Creacion CHAR(25), Usuario_Modificacion CHAR(25))

	CREATE TABLE #TempDetallePromociones ( Id_Detalle_Promocion VARCHAR(36), Id_Promocion VARCHAR(36), Id_Empresa_Servicio VARCHAR(36))

	CREATE TABLE #TempDetallePromocionesExistente (Id_Promocion VARCHAR(36))
	 
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

	;WITH cte_detallePromocionExiste (	
		Id_Promocion,	
		X
	)
	AS (
		SELECT		
			dp.Id_Promocion,		
			COUNT(*)
		FROM
			DETALLE_PROMOCIONES dp
			INNER JOIN #TempDetallePromociones tdp ON tdp.Id_Empresa_Servicio = dp.ID_EMPRESA_SERVICIO
			WHERE dp.ID_PROMOCION <> tdp.Id_Promocion
			GROUP BY dp.Id_Promocion
			HAVING COUNT(*) = @NoRegistros
	)	
	INSERT INTO #TempDetallePromocionesExistente (Id_Promocion) SELECT Id_Promocion FROM cte_detallePromocionExiste
	SET @NoFilasTempDetallesPromociones = (SELECT COUNT(Id_Promocion) FROM #TempDetallePromocionesExistente)

	IF(@NoFilasTempDetallesPromociones > 0) BEGIN
		SET @Mensaje  = 'No puede agregar el servicio porque ya hay una promoción con los servicios seleccionados'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END	

	MERGE PROMOCIONES AS TARGET
	USING #TempPromociones AS SOURCE
	ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_PROMOCION = SOURCE.Id_Promocion
	WHEN MATCHED THEN
		UPDATE
			SET TARGET.ID_TIPO_PROMOCION = SOURCE.Id_Tipo_Promocion, TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.VALOR = SOURCE.Valor, TARGET.ESTADO = SOURCE.Estado, FECHA_MODIFICACION = @FechaActual, TARGET.USUARIO_MODIFICACION = SOURCE.Usuario_Modificacion
	WHEN NOT MATCHED THEN
		INSERT (ID_PROMOCION, ID_TIPO_PROMOCION, DESCRIPCION, VALOR, ESTADO, ID_EMPRESA, FECHA_CREACION, FECHA_MODIFICACION, USUARIO_CREACION, USUARIO_MODIFICACION)
		VALUES (@IdPromocion , SOURCE.Id_Tipo_Promocion, SOURCE.Descripcion, SOURCE.Valor, SOURCE.Estado, SOURCE.Id_Empresa, @FechaActual, @FechaActual, SOURCE.Usuario_Creacion, SOURCE.Usuario_Modificacion);
		
	MERGE DETALLE_PROMOCIONES AS TARGET
	USING #TempDetallePromociones AS SOURCE
	ON TARGET.ID_DETALLE_PROMOCION = SOURCE.Id_Detalle_Promocion AND TARGET.ID_PROMOCION = SOURCE.Id_Promocion
	WHEN NOT MATCHED THEN
		INSERT (ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO)
		VALUES (NEWID(), @IdPromocion, SOURCE.Id_Empresa_Servicio);			
		
	IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
	IF OBJECT_ID('tempdb..#TempDetallePromociones') IS NOT NULL DROP TABLE #TempDetallePromociones
	IF OBJECT_ID('tempdb..#TempDetallePromocionesExistente') IS NOT NULL DROP TABLE #TempDetallePromocionesExistente	

END

GO