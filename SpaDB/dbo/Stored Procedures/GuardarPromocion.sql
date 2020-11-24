CREATE PROCEDURE GuardarPromocion (
	@JsonPromocion NVARCHAR(MAX)
)
AS
BEGIN	
	
	DECLARE @HasChanged BIT
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @IdPromocion UNIQUEIDENTIFIER = NEWID()	
	DECLARE @Mensaje CHAR(200)
	DECLARE @PromocionesIguales INT

	CREATE TABLE #TempPromociones (Id_Promocion VARCHAR(36), Id_Tipo_Promocion VARCHAR(36), 
	Descripcion VARCHAR(200), Valor DECIMAL(18,2), Estado CHAR(10), Id_Empresa UNIQUEIDENTIFIER, Usuario_Creacion CHAR(25), Usuario_Modificacion CHAR(25))

	CREATE TABLE #TempDetallePromociones ( Id INT IDENTITY(1,1), Id_Detalle_Promocion VARCHAR(36), Id_Promocion VARCHAR(36), Id_Empresa_Servicio VARCHAR(36))	

	CREATE TABLE #PromocionesServicios (Id_Promocion UNIQUEIDENTIFIER, ServiciosPromocion INT)

	CREATE TABLE #PromocionesResultantes (Id_Promocion UNIQUEIDENTIFIER, ServiciosEncontrados INT DEFAULT(0), ServiciosPromocion INT)
	 
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
	DECLARE @Id INT = 1
	DECLARE @ServiciosEncontrados INT = 0

	WHILE (SELECT COUNT(Id) FROM #TempDetallePromociones) > 0 BEGIN

		DECLARE @IdEmpresaServicio UNIQUEIDENTIFIER = (SELECT TOP 1 Id_Empresa_Servicio FROM #TempDetallePromociones WHERE Id = @Id)

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

		DELETE FROM #TempDetallePromociones 
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