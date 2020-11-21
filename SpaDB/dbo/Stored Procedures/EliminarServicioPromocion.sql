CREATE PROCEDURE EliminarServicioPromocion(
	@IdDetallePromocion UNIQUEIDENTIFIER,
	@IdPromocion UNIQUEIDENTIFIER
)
AS
BEGIN
	
	DECLARE @IdPromocionExistente UNIQUEIDENTIFIER
	DECLARE @RowsDetallePromo INT
	DECLARE @RowsTempDetallePromo INT

	CREATE TABLE #TempPromoUpdated (Id_Detalle_Promocion UNIQUEIDENTIFIER, Id_Promocion UNIQUEIDENTIFIER, Id_Empresa_Servicio UNIQUEIDENTIFIER)

	INSERT INTO #TempPromoUpdated (Id_Detalle_Promocion, Id_Promocion, Id_Empresa_Servicio)
	SELECT ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocion

	DELETE FROM #TempPromoUpdated WHERE Id_Detalle_Promocion = @IdDetallePromocion
	   	  
	SET @IdPromocionExistente = (SELECT TOP 1 t1.ID_PROMOCION 
								FROM DETALLE_PROMOCIONES t1, DETALLE_PROMOCIONES t2
								INNER JOIN #TempPromoUpdated ON #TempPromoUpdated.Id_Empresa_Servicio = t2.ID_EMPRESA_SERVICIO
								WHERE t1.ID_PROMOCION = t2.ID_PROMOCION)						

	
	SET @RowsDetallePromo = (SELECT COUNT(ID_EMPRESA_SERVICIO) FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocionExistente)
	SET @RowsTempDetallePromo = (SELECT COUNT(Id_Empresa_Servicio) FROM #TempPromoUpdated)
	
	
	IF(@RowsTempDetallePromo > 0) BEGIN
		IF(@RowsDetallePromo = @RowsTempDetallePromo) BEGIN
		DECLARE @Mensaje CHAR(200) = 'No puede eliminar este servicio porque ya existe una promoción con los servicios restantes'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
		END
	END	

	IF((SELECT COUNT(ID_DETALLE_PROMOCION) FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocion) = 1) BEGIN
		DELETE FROM DETALLE_PROMOCIONES WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion
		DELETE FROM PROMOCIONES WHERE ID_PROMOCION = @IdPromocion
	END
	ELSE BEGIN
		DELETE FROM DETALLE_PROMOCIONES WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion
	END

	IF OBJECT_ID('tempdb..#TempPromoUpdated') IS NOT NULL DROP TABLE #TempPromoUpdated

END

GO