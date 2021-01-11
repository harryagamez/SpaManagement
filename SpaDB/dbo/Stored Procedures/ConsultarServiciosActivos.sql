CREATE PROCEDURE [dbo].[ConsultarServiciosActivos](
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN
	
	SET NOCOUNT ON;

	CREATE TABLE #TempServicios(Id_Empresa_Servicio VARCHAR(36), Id_Servicio INT, Nombre CHAR(36), Descripcion CHAR(300), 
	Valor DECIMAL(18,2), Aplicacion_Nomina DECIMAL(18,2), Tiempo INT, Id_TipoServicio INT, Estado CHAR(10), Id_Empresa VARCHAR(36), 
	Logo_Base64 NVARCHAR(MAX), Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Nombre_Tipo_Servicio CHAR(30))	

	INSERT INTO #TempServicios (Id_Empresa_Servicio, Id_Servicio, Nombre, Descripcion, Valor, Aplicacion_Nomina, Tiempo, Id_TipoServicio, 
	Estado, Id_Empresa, Logo_Base64, Fecha_Registro, Fecha_Modificacion, Nombre_Tipo_Servicio)	
	SELECT 
		ES.ID_EMPRESA_SERVICIO, ES.ID_SERVICIO, RTRIM(SE.NOMBRE) AS NOMBRE, RTRIM(SE.DESCRIPCION) AS DESCRIPCION, VALOR, APLICACION_NOMINA,
		TIEMPO, SE.ID_TIPOSERVICIO AS ID_TIPOSERVICIO, RTRIM(ESTADO) AS ESTADO,CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA, LOGO_BASE64,
		ES.FECHA_REGISTRO AS FECHA_REGISTRO, ES.FECHA_MODIFICACION AS FECHA_MODIFICACION, RTRIM(TS.NOMBRE) AS NOMBRE_TIPO_SERVICIO		
	FROM EMPRESA_SERVICIOS ES
	INNER JOIN SERVICIOS SE
	ON ES.ID_SERVICIO = SE.ID_SERVICIO	
	INNER JOIN TIPO_SERVICIO TS
	ON SE.ID_TIPOSERVICIO = TS.ID_TIPOSERVICIO	
	WHERE CAST(ID_EMPRESA AS VARCHAR(36)) = @IdEmpresa AND es.ESTADO = 'ACTIVO'
	ORDER BY NOMBRE ASC

	SELECT 
		Id_Empresa_Servicio, Id_Servicio, RTRIM(Nombre) AS Nombre, RTRIM(Descripcion) AS Descripcion, 
		Valor, Aplicacion_Nomina, Tiempo, Id_TipoServicio, RTRIM(Estado) AS Estado,Id_Empresa, RTRIM(Logo_Base64) AS Logo_Base64, 
		Fecha_Registro, Fecha_Modificacion, RTRIM(Nombre_Tipo_Servicio) AS Nombre_Tipo_Servicio
	FROM #TempServicios 
	ORDER BY Nombre	

	IF OBJECT_ID('tempdb..#TempServicios') IS NOT NULL DROP TABLE #TempServicios	

END

GO