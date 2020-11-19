CREATE PROCEDURE GuardarPromocion (
	@JsonPromocion NVARCHAR(MAX)
)
AS
BEGIN
	
	DECLARE @IdEmpresa UNIQUEIDENTIFIER
	DECLARE @IdPromocion UNIQUEIDENTIFIER = NEWID()	
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @IdPromocionExistente UNIQUEIDENTIFIER
	DECLARE @RowsDetallePromo INT
	DECLARE @RowsTempDetallePromo INT
	DECLARE @HasChanged BIT
	

	CREATE TABLE #TempPromociones ( Id_Promocion UNIQUEIDENTIFIER, Id_Tipo_Promocion UNIQUEIDENTIFIER, 
	Descripcion VARCHAR(200), Valor DECIMAL(18,2), Estado CHAR(10), Id_Empresa UNIQUEIDENTIFIER, Usuario_Creacion CHAR(25), Usuario_Modificacion CHAR(25))

	CREATE TABLE #TempDetallePromociones ( Id_Detalle_Promocion UNIQUEIDENTIFIER, Id_Promocion UNIQUEIDENTIFIER, Id_Empresa_Servicio UNIQUEIDENTIFIER)	

	 
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
		Id_Promocion UNIQUEIDENTIFIER '$.Id_Promocion', 
		Id_Tipo_Promocion UNIQUEIDENTIFIER '$.Id_Tipo_Promocion',
		Descripcion VARCHAR(200) '$.Descripcion',
		Valor DECIMAL(18,2) '$.Valor',
		Estado CHAR(10) '$.Estado',
		Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa',
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
		Id_Detalle_Promocion UNIQUEIDENTIFIER '$.Id_Detalle_Promocion',
		Id_Promocion UNIQUEIDENTIFIER '$.Id_Promocion',
		Id_Empresa_Servicio UNIQUEIDENTIFIER '$.Id_Empresa_Servicio'
	) DetallesPromocion

	SET @IdPromocionExistente = (SELECT TOP 1 t1.ID_PROMOCION 
								FROM DETALLE_PROMOCIONES t1, DETALLE_PROMOCIONES t2
								INNER JOIN #TempDetallePromociones ON #TempDetallePromociones.Id_Empresa_Servicio = t2.ID_EMPRESA_SERVICIO
								WHERE t1.ID_PROMOCION = t2.ID_PROMOCION)						

	
	SET @RowsDetallePromo = (SELECT COUNT(ID_EMPRESA_SERVICIO) FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocionExistente)
	SET @RowsTempDetallePromo = (SELECT COUNT(ID_EMPRESA_SERVICIO) FROM #TempDetallePromociones)
	
	IF(@RowsTempDetallePromo > 0 AND @RowsDetallePromo = @RowsTempDetallePromo) BEGIN
		DECLARE @Mensaje CHAR(200) = 'Ya existe una promoción con los servicios seleccionados'
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
		VALUES (@IdPromocion, SOURCE.Id_Tipo_Promocion, SOURCE.Descripcion, SOURCE.Valor, SOURCE.Estado, SOURCE.Id_Empresa, @FechaActual, @FechaActual, SOURCE.Usuario_Creacion, SOURCE.Usuario_Modificacion);					

	IF(@HasChanged = 1) BEGIN
		INSERT INTO DETALLE_PROMOCIONES (ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO)
		SELECT NEWID(), Id_Promocion, Id_Empresa_Servicio FROM #TempDetallePromociones			
	END
	ELSE BEGIN
		INSERT INTO DETALLE_PROMOCIONES (ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO)
		SELECT NEWID(), @IdPromocion, Id_Empresa_Servicio FROM #TempDetallePromociones		
	END
			
		
	IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
	IF OBJECT_ID('tempdb..#TempDetalle_Promociones') IS NOT NULL DROP TABLE #TempDetalle_Promociones

END
