CREATE PROCEDURE GuardarPromocion (
	@JsonPromocion NVARCHAR(MAX)
)
AS
BEGIN
	
	SET XACT_ABORT, NOCOUNT ON
	
	DECLARE @IdEmpresa UNIQUEIDENTIFIER
	DECLARE @IdPromocion UNIQUEIDENTIFIER = NEWID()	
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @IdPromocionExistente UNIQUEIDENTIFIER
	DECLARE @RowsDetallePromo INT
	DECLARE @RowsTempDetallePromo INT
	

	CREATE TABLE #TempPromociones ( Id_Promocion UNIQUEIDENTIFIER, Id_Tipo_Promocion UNIQUEIDENTIFIER, 
	Descripcion VARCHAR(200), Valor DECIMAL(18,2), Estado CHAR(10), Id_Empresa UNIQUEIDENTIFIER)

	CREATE TABLE #TempDetallePromociones ( Id_Detalle_Promocion UNIQUEIDENTIFIER, Id_Promocion UNIQUEIDENTIFIER, Id_Empresa_Servicio UNIQUEIDENTIFIER)	

	INSERT INTO #TempPromociones (Id_Promocion, Id_Tipo_Promocion, Descripcion, Valor, Estado, Id_Empresa)
	SELECT 
		Id_Promocion, Id_Tipo_Promocion, Descripcion, Valor, Estado, Id_Empresa
	FROM 
		OPENJSON(@JsonPromocion)
	WITH (
		Id_Promocion UNIQUEIDENTIFIER '$.Id_Promocion', 
		Id_Tipo_Promocion UNIQUEIDENTIFIER '$.Id_Tipo_Promocion',
		Descripcion VARCHAR(200) '$.Descripcion',
		Valor DECIMAL(18,2) '$.Valor',
		Estado CHAR(10) '$.Estado',
		Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa'
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
	
	IF(@RowsDetallePromo = @RowsTempDetallePromo) BEGIN
		DECLARE @Mensaje CHAR(200) = 'Ya existe una promoción con los servicios seleccionados'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	BEGIN TRY

		BEGIN TRANSACTION Tn_GuardarPromocion

			MERGE PROMOCIONES AS TARGET
			USING #TempPromociones AS SOURCE
			ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa AND TARGET.ID_PROMOCION = SOURCE.Id_Promocion
			WHEN MATCHED THEN
				UPDATE
					SET TARGET.ID_TIPO_PROMOCION = SOURCE.Id_Tipo_Promocion, TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.VALOR = SOURCE.Valor, TARGET.ESTADO = SOURCE.Estado, FECHA_MODIFICACION = @FechaActual
			WHEN NOT MATCHED THEN
				INSERT (ID_PROMOCION, ID_TIPO_PROMOCION, DESCRIPCION, VALOR, ESTADO, ID_EMPRESA, FECHA_CREACION, FECHA_MODIFICACION, USUARIO_CREACION, USUARIO_MODIFICACION)
				VALUES (@IdPromocion, SOURCE.Id_Tipo_Promocion, SOURCE.Descripcion, SOURCE.Valor, SOURCE.Estado, SOURCE.Id_Empresa, @FechaActual, @FechaActual, NULL, NULL);

			MERGE DETALLE_PROMOCIONES AS TARGET
			USING #TempDetallePromociones AS SOURCE
			ON TARGET.ID_PROMOCION = SOURCE.Id_Promocion AND TARGET.ID_EMPRESA_SERVICIO = SOURCE.Id_Empresa_Servicio
			WHEN NOT MATCHED THEN
				INSERT (ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO)
				VALUES (NEWID(), @IdPromocion, SOURCE.Id_Empresa_Servicio);

		COMMIT TRANSACTION Tn_GuardarPromocion
		
		IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
		IF OBJECT_ID('tempdb..#TempDetalle_Promociones') IS NOT NULL DROP TABLE #TempDetalle_Promociones

	END TRY

	BEGIN CATCH	
		
		IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
		IF OBJECT_ID('tempdb..#TempDetalle_Promociones') IS NOT NULL DROP TABLE #TempDetalle_Promociones
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_GuardarPromocion
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
		RAISERROR (@ErrorMessage, 16, 1)	
		
	END CATCH

END
GO