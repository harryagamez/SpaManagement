CREATE PROCEDURE ConsultarPromociones (
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN

	CREATE TABLE #TempPromociones(Id_Promocion VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Tipo_Promocion VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS,
	Descripcion VARCHAR(200) COLLATE SQL_Latin1_General_CP1_CI_AS, Tipo_Promocion VARCHAR(25) COLLATE SQL_Latin1_General_CP1_CI_AS, Valor DECIMAL (18, 2), 
	Estado CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Fecha_Creacion DATETIME, Fecha_Modificacion DATETIME,
	Usuario_Creacion CHAR(25) COLLATE SQL_Latin1_General_CP1_CI_AS, Usuario_Modificacion CHAR(25) COLLATE SQL_Latin1_General_CP1_CI_AS)

	CREATE TABLE #TempDetallePromocion (Id_Detalle_Promocion VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Promocion VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Id_Empresa_Servicio VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Nombre_Servicio CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS,
	Nombre_Promocion VARCHAR(200) COLLATE SQL_Latin1_General_CP1_CI_AS, Valor DECIMAL(18,2))

	INSERT INTO #TempPromociones (Id_Promocion, Id_Tipo_Promocion, Descripcion, Tipo_Promocion, Valor, Estado, Id_Empresa, Fecha_Creacion, 
	Fecha_Modificacion, Usuario_Creacion, Usuario_Modificacion)	
	SELECT 
		RTRIM(ID_PROMOCION) AS Id_Promocion,
		RTRIM(Promociones.ID_TIPO_PROMOCION) AS Id_Tipo_Promocion,
		RTRIM(Promociones.DESCRIPCION) AS Descripcion,
		RTRIM(TipoPromociones.DESCRIPCION) AS Tipo_Promocion,
		VALOR AS Valor,
		RTRIM(ESTADO) AS Estado,
		RTRIM(ID_EMPRESA) AS Id_Empresa,
		FECHA_CREACION AS Fecha_Creacion,
		FECHA_MODIFICACION AS Fecha_Modificacion,
		RTRIM(USUARIO_CREACION) AS Usuario_Creacion,
		RTRIM(USUARIO_MODIFICACION) AS Usuario_Modificacion
	FROM PROMOCIONES Promociones
	INNER JOIN TIPO_PROMOCIONES TipoPromociones
	ON TipoPromociones.ID_TIPO_PROMOCION = Promociones.ID_TIPO_PROMOCION
	WHERE ID_EMPRESA = @IdEmpresa

	INSERT INTO #TempDetallePromocion(Id_Detalle_Promocion, Id_Promocion, Id_Empresa_Servicio, 
	Nombre_Servicio, Nombre_Promocion, Valor)	
	SELECT 
		ID_DETALLE_PROMOCION, DetallePromociones.ID_PROMOCION, DetallePromociones.ID_EMPRESA_SERVICIO, 
		Servicios.NOMBRE AS Nombre_Servicio, #TempPromociones.Descripcion AS Nombre_Promocion, #TempPromociones.Valor AS Valor
	FROM DETALLE_PROMOCIONES DetallePromociones
	INNER JOIN #TempPromociones
	ON DetallePromociones.ID_PROMOCION = #TempPromociones.Id_Promocion
	INNER JOIN EMPRESA_SERVICIOS EmpresaServicios 
	ON DetallePromociones.ID_EMPRESA_SERVICIO = EmpresaServicios.ID_EMPRESA_SERVICIO
	INNER JOIN SERVICIOS Servicios 
	ON EmpresaServicios.ID_SERVICIO = Servicios.ID_SERVICIO	

	SELECT 
		RTRIM(Id_Promocion) AS Id_Promocion, 
		RTRIM(Id_Tipo_Promocion) AS Id_Tipo_Promocion, 
		RTRIM(Descripcion) AS Descripcion,
		RTRIM(Tipo_Promocion) AS Tipo_Promocion,
		Valor, 
		RTRIM(Estado) AS Estado, 
		RTRIM(Id_Empresa) AS Id_Empresa, 
		Fecha_Creacion, 
		Fecha_Modificacion, 
		RTRIM(Usuario_Creacion) AS Usuario_Creacion, 
		RTRIM(Usuario_Modificacion) AS Usuario_Modificacion
	FROM #TempPromociones	

	SELECT  
		RTRIM(Id_Detalle_Promocion) AS Id_Detalle_Promocion,
		RTRIM(Id_Promocion) AS Id_Promocion,
		RTRIM(Id_Empresa_Servicio) AS Id_Empresa_Servicio,
		RTRIM(Nombre_Servicio) AS Nombre_Servicio,
		RTRIM(Nombre_Promocion) AS Nombre_Promocion,
		Valor
	FROM #TempDetallePromocion

	IF OBJECT_ID('tempdb..#TempPromociones') IS NOT NULL DROP TABLE #TempPromociones
	IF OBJECT_ID('tempdb..#TempDetallePromocion') IS NOT NULL DROP TABLE #TempDetallePromocion

END

GO