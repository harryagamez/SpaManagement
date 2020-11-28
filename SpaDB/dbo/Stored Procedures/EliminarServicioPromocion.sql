CREATE PROCEDURE [dbo].[EliminarServicioPromocion] (
	@IdDetallePromocion UNIQUEIDENTIFIER,
	@IdPromocion UNIQUEIDENTIFIER
)
AS
	SET ANSI_WARNINGS OFF
BEGIN
	DECLARE @Mensaje CHAR(600)
	DECLARE @IdServicioEliminar VARCHAR(36)

	CREATE TABLE #TempPromoUpdated (Id_Detalle_Promocion VARCHAR(36), Id_Promocion VARCHAR(36), Id_Empresa_Servicio VARCHAR(36))
	CREATE TABLE #Busqueda (Id_Promocion VARCHAR(36), EqualCount INT, TotalCount Int)

	INSERT INTO #TempPromoUpdated (Id_Detalle_Promocion, Id_Promocion, Id_Empresa_Servicio)
	SELECT 
		ID_DETALLE_PROMOCION, 
		ID_PROMOCION, 
		ID_EMPRESA_SERVICIO 
	FROM DETALLE_PROMOCIONES 
	WHERE ID_PROMOCION = @IdPromocion

	DELETE FROM #TempPromoUpdated 
	WHERE Id_Detalle_Promocion = @IdDetallePromocion	
	
	DECLARE @NoRegistros INT = (SELECT COUNT(*) FROM #TempPromoUpdated)

	SET @IdServicioEliminar = (SELECT (ID_EMPRESA_SERVICIO) FROM DETALLE_PROMOCIONES WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion)
	
	INSERT INTO #Busqueda (Id_Promocion, EqualCount, TotalCount)
	SELECT 
		d1.ID_PROMOCION,
		COUNT (CASE WHEN d1.ID_EMPRESA_SERVICIO = d2.ID_EMPRESA_SERVICIO THEN 1 ELSE NULL END) equalcount,
		COUNT (d1.ID_DETALLE_PROMOCION) totalcount
	FROM DETALLE_PROMOCIONES d1
	LEFT JOIN DETALLE_PROMOCIONES d2
		ON d1.ID_EMPRESA_SERVICIO = d2.ID_EMPRESA_SERVICIO
		AND d1.ID_DETALLE_PROMOCION <> d2.ID_DETALLE_PROMOCION
		AND d2.ID_EMPRESA_SERVICIO NOT IN (@IdServicioEliminar)
		AND d2.ID_PROMOCION = @IdPromocion
	WHERE
		d1.ID_PROMOCION <> @IdPromocion
	GROUP BY
		d1.ID_PROMOCION
	HAVING 
		COUNT(CASE WHEN d1.ID_EMPRESA_SERVICIO = d2.ID_EMPRESA_SERVICIO THEN 1 ELSE NULL END) = COUNT(d1.ID_DETALLE_PROMOCION)	
	
	DELETE Busqueda
	FROM #Busqueda Busqueda
	INNER JOIN PROMOCIONES ON Busqueda.Id_Promocion = PROMOCIONES.ID_PROMOCION
	WHERE TotalCount > @NoRegistros OR TotalCount < @NoRegistros OR EqualCount <> @NoRegistros	OR PROMOCIONES.ESTADO = 'INACTIVA'		

	DECLARE @BusquedaFinal INT = (SELECT COUNT(Id_Promocion) FROM #Busqueda)
	DECLARE @PromoRepetida CHAR(200) = (SELECT TOP 1 PROMOCIONES.DESCRIPCION FROM #Busqueda INNER JOIN PROMOCIONES ON #Busqueda.Id_Promocion = PROMOCIONES.ID_PROMOCION)
	
	SET @PromoRepetida = REPLACE(@PromoRepetida, '%','%%')

	IF(@BusquedaFinal > 0) BEGIN
		SET @Mensaje  = 'No se pudo eliminar el servicio de la promoción porque la promoción resultante es identica a la promoción ' + @PromoRepetida		
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	IF((SELECT COUNT(ID_DETALLE_PROMOCION) FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = @IdPromocion) = 1) BEGIN
		DELETE 
			FROM DETALLE_PROMOCIONES 
		WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion

		DELETE 
			FROM PROMOCIONES 
		WHERE ID_PROMOCION = @IdPromocion
	END
	ELSE BEGIN
		DELETE 
			FROM DETALLE_PROMOCIONES 
		WHERE ID_DETALLE_PROMOCION = @IdDetallePromocion
	END

	IF OBJECT_ID('tempdb..#TempPromoUpdated') IS NOT NULL DROP TABLE #TempPromoUpdated	
	IF OBJECT_ID('tempdb..#Busqueda') IS NOT NULL DROP TABLE #Busqueda

END

GO
