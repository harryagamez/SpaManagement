CREATE PROCEDURE EliminarServicioPromocion(
	@IdDetallePromocion UNIQUEIDENTIFIER,
	@IdPromocion UNIQUEIDENTIFIER
)
AS
BEGIN
	
	IF OBJECT_ID('tempdb..#TempPromoUpdated') IS NOT NULL DROP TABLE #TempPromoUpdated
	IF OBJECT_ID('tempdb..#TempDetallePromocionesExistente') IS NOT NULL DROP TABLE #TempDetallePromocionesExistente

	DECLARE @IdPromocionExistente VARCHAR(36)	
	DECLARE @RowsTempDetallePromo INT
	DECLARE @Mensaje CHAR(200)

	CREATE TABLE #TempPromoUpdated (Id_Detalle_Promocion VARCHAR(36), Id_Promocion VARCHAR(36), Id_Empresa_Servicio VARCHAR(36))
	CREATE TABLE #TempDetallePromocionesExistente (Id_Promocion VARCHAR(36))

	INSERT INTO #TempPromoUpdated (Id_Detalle_Promocion, Id_Promocion, Id_Empresa_Servicio)
	SELECT ID_DETALLE_PROMOCION, ID_PROMOCION, ID_EMPRESA_SERVICIO FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocion

	DELETE FROM #TempPromoUpdated WHERE Id_Detalle_Promocion = @IdDetallePromocion	   	  
	
	DECLARE @NoRegistros INT = (SELECT COUNT(*) FROM #TempPromoUpdated)

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
			INNER JOIN #TempPromoUpdated tdp ON tdp.Id_Empresa_Servicio = dp.ID_EMPRESA_SERVICIO
			WHERE dp.ID_PROMOCION <> tdp.Id_Promocion
			GROUP BY dp.Id_Promocion
			HAVING COUNT(*) = @NoRegistros
	)	
	INSERT INTO #TempDetallePromocionesExistente (Id_Promocion) SELECT Id_Promocion FROM cte_detallePromocionExiste
	SET @RowsTempDetallePromo = (SELECT COUNT(Id_Promocion) FROM #TempDetallePromocionesExistente)

	IF(@RowsTempDetallePromo > 0) BEGIN
		SET @Mensaje  = 'No puede agregar el servicio porque ya hay una promoción con los servicios seleccionados'		
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END	

	IF((SELECT COUNT(ID_DETALLE_PROMOCION) FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocion) = 1) BEGIN
		DELETE FROM DETALLE_PROMOCIONES WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion
		DELETE FROM PROMOCIONES WHERE ID_PROMOCION = @IdPromocion
	END
	ELSE BEGIN
		DELETE FROM DETALLE_PROMOCIONES WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion
	END

	IF OBJECT_ID('tempdb..#TempPromoUpdated') IS NOT NULL DROP TABLE #TempPromoUpdated
	IF OBJECT_ID('tempdb..#TempDetallePromocionesExistente') IS NOT NULL DROP TABLE #TempDetallePromocionesExistente

END

GO