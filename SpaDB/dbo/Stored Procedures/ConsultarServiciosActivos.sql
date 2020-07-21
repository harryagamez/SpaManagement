CREATE PROCEDURE ConsultarServiciosActivos(@IdEmpresa VARCHAR(36))
AS
BEGIN

	CREATE TABLE #TempServicios(Id_Servicio INT, Nombre CHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Descripcion CHAR(300) COLLATE SQL_Latin1_General_CP1_CI_AS, Valor REAL, Tiempo INT,
	Id_TipoServicio INT, Estado CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Logo_Base64 NVARCHAR(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Nombre_Tipo_Servicio CHAR(30) COLLATE SQL_Latin1_General_CP1_CI_AS)

	CREATE TABLE #TempServicioImagenes (Id_Servicio_Imagen VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Servicio INT, Imagen_Base64 NVARCHAR(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Fecha_Registro DATETIME, Fecha_Modificacion DATETIME)

	INSERT INTO #TempServicios (Id_Servicio, Nombre, Descripcion, Valor, Tiempo, Id_TipoServicio, Estado, Id_Empresa, Logo_Base64, Fecha_Registro, Fecha_Modificacion, Nombre_Tipo_Servicio)	
	SELECT 
		SERVICIOS.ID_SERVICIO, RTRIM(SERVICIOS.NOMBRE) AS NOMBRE,RTRIM(SERVICIOS.DESCRIPCION) AS DESCRIPCION, VALOR, TIEMPO,
		SERVICIOS.ID_TIPOSERVICIO,RTRIM(ESTADO) AS ESTADO,CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA,LOGO_BASE64,
		SERVICIOS.FECHA_REGISTRO,SERVICIOS.FECHA_MODIFICACION,RTRIM(TIPO_SERVICIO.NOMBRE) AS NOMBRE_TIPO_SERVICIO		
	FROM SERVICIOS 
	INNER JOIN TIPO_SERVICIO 
	ON SERVICIOS.ID_TIPOSERVICIO = TIPO_SERVICIO.ID_TIPOSERVICIO 	
	WHERE CAST(ID_EMPRESA AS VARCHAR(36)) = @IdEmpresa AND SERVICIOS.ESTADO = 'ACTIVO'
	ORDER BY SERVICIOS.NOMBRE ASC

	INSERT INTO #TempServicioImagenes(Id_Servicio_Imagen, Id_Servicio, Imagen_Base64, Fecha_Registro, Fecha_Modificacion)	
	SELECT 
		ID_SERVICIO_IMAGEN, SERVICIO_IMAGENES.ID_SERVICIO, IMAGEN_BASE64, 
		SERVICIO_IMAGENES.FECHA_REGISTRO, SERVICIO_IMAGENES.FECHA_MODIFICACION 
	FROM SERVICIO_IMAGENES 
	INNER JOIN #TempServicios ON SERVICIO_IMAGENES.ID_SERVICIO = #TempServicios.Id_Servicio

	SELECT 
		Id_Servicio,RTRIM(Nombre) AS Nombre, RTRIM(Descripcion) AS Descripcion, Valor, 
		Tiempo, Id_TipoServicio, RTRIM(Estado) AS Estado,Id_Empresa, RTRIM(Logo_Base64) AS Logo_Base64, 
		Fecha_Registro, Fecha_Modificacion, RTRIM(Nombre_Tipo_Servicio) AS Nombre_Tipo_Servicio
	FROM #TempServicios 
	ORDER BY Nombre

	SELECT * FROM #TempServicioImagenes

	IF OBJECT_ID('tempdb..#TempServicios') IS NOT NULL DROP TABLE #TempServicios
	IF OBJECT_ID('tempdb..#TempServicioImagenes') IS NOT NULL DROP TABLE #TempServicioImagenes

END

GO