CREATE PROCEDURE [dbo].[EliminarServicioPromocion] (
	@IdDetallePromocion UNIQUEIDENTIFIER,
	@IdPromocion UNIQUEIDENTIFIER
)
AS
BEGIN

	DECLARE @IdPromocionExistente VARCHAR(36)	
	DECLARE @RowsTempDetallePromo INT
	DECLARE @Mensaje CHAR(200)
	DECLARE @PromocionesIguales INT

	CREATE TABLE #TempPromoUpdated (Id INT IDENTITY(1,1), Id_Detalle_Promocion VARCHAR(36), Id_Promocion VARCHAR(36), Id_Empresa_Servicio VARCHAR(36))

	CREATE TABLE #TempDetallePromocionesExistente (Id_Promocion VARCHAR(36))

	CREATE TABLE #PromocionesServicios (Id_Promocion UNIQUEIDENTIFIER, ServiciosPromocion INT)

	CREATE TABLE #PromocionesResultantes (Id_Promocion UNIQUEIDENTIFIER, ServiciosEncontrados INT DEFAULT(0), ServiciosPromocion INT)

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
	DECLARE @Id INT = 1
	DECLARE @ServiciosEncontrados INT = 0

	WHILE (SELECT COUNT(Id) FROM #TempPromoUpdated) > 0 BEGIN

		DECLARE @IdEmpresaServicio UNIQUEIDENTIFIER = (SELECT TOP 1 Id_Empresa_Servicio FROM #TempPromoUpdated WHERE Id = @Id)

		INSERT INTO #PromocionesServicios (Id_Promocion, ServiciosPromocion)
		SELECT 
			Detalles.ID_PROMOCION,
			(SELECT COUNT(*) FROM DETALLE_PROMOCIONES WHERE ID_PROMOCION = Detalles.ID_PROMOCION) AS CantidadServicios
		FROM DETALLE_PROMOCIONES Detalles
		INNER JOIN PROMOCIONES
		ON Detalles.ID_PROMOCION = PROMOCIONES.ID_PROMOCION
		WHERE ID_EMPRESA_SERVICIO = @IdEmpresaServicio
		AND Detalles.ID_PROMOCION <> @IdPromocion
		AND PROMOCIONES.ESTADO = 'ACTIVA'
		GROUP BY Detalles.ID_PROMOCION

		IF (SELECT COUNT(Id_Promocion) FROM #PromocionesServicios) > 0 BEGIN

			SET @ServiciosEncontrados = @ServiciosEncontrados + 1

			MERGE #PromocionesResultantes TARGET
			USING #PromocionesServicios SOURCE
			ON TARGET.Id_Promocion = SOURCE.Id_Promocion
			WHEN MATCHED THEN
				UPDATE SET 
					TARGET.ServiciosEncontrados = @ServiciosEncontrados,
					TARGET.ServiciosPromocion = SOURCE.ServiciosPromocion
			WHEN NOT MATCHED THEN
				INSERT (Id_Promocion, ServiciosEncontrados, ServiciosPromocion)
				VALUES (SOURCE.Id_Promocion, @ServiciosEncontrados, SOURCE.ServiciosPromocion);

		END

		DELETE FROM #PromocionesServicios

		DELETE FROM #TempPromoUpdated 
		WHERE Id = @Id

		SET @Id = @Id + 1

	END

	SET @PromocionesIguales = (
		SELECT TOP 1 
			COUNT(Id_Promocion) AS CantidadPromociones 
		FROM #PromocionesResultantes 
		WHERE ServiciosEncontrados = ServiciosPromocion
		AND ServiciosPromocion = @NoRegistros
	)

	IF @PromocionesIguales > 0 BEGIN
		SET @Mensaje  = 'No puede eliminar el servicio pues la promoción resultante, es identica a una promoción existente'		
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
	IF OBJECT_ID('tempdb..#TempDetallePromocionesExistente') IS NOT NULL DROP TABLE #TempDetallePromocionesExistente
	IF OBJECT_ID('tempdb..#PromocionesServicios') IS NOT NULL DROP TABLE #PromocionesServicios
	IF OBJECT_ID('tempdb..#PromocionesResultantes') IS NOT NULL DROP TABLE #PromocionesResultantes

END

GO
