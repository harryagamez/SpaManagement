CREATE PROCEDURE RegistrarSesion (
	@JsonSesion NVARCHAR(MAX)
)
AS
BEGIN	
	
	DECLARE @Localizacion GEOGRAPHY

	CREATE TABLE #TempRegistro_Sesiones (Id_Registro UNIQUEIDENTIFIER, Usuario_Registro CHAR(25), Fecha_Registro DATETIME, 
	Ip_Address CHAR(15), Hostname CHAR(60), Region CHAR(60), Pais VARCHAR(10), Localizacion GEOGRAPHY, Org CHAR(100), 
	Codigo_Postal CHAR(32), Zona_Horaria CHAR(100), Id_Empresa UNIQUEIDENTIFIER)
	
	SELECT 
		@Localizacion = GEOGRAPHY::Point(SUBSTRING(Localizacion, 0, CHARINDEX(',', Localizacion, 0)), 
		SUBSTRING(Localizacion, CHARINDEX(',', Localizacion) + 1, LEN(Localizacion)), 4326)
	FROM 
		OPENJSON(@JsonSesion)
	WITH (
		Localizacion VARCHAR(60) '$.Localizacion'
	)	
	
	INSERT INTO #TempRegistro_Sesiones (Usuario_Registro, Fecha_Registro, Ip_Address, 
	Hostname, Region, Pais, Localizacion, Org, Codigo_Postal, Zona_Horaria, Id_Empresa)
	SELECT		
		Usuario_Registro,
		GETDATE(),
		Ip_Address,
		Hostname,
		Region,
		Pais,
		@Localizacion,
		Org,
		Codigo_Postal,
		Zona_Horaria,
		Id_Empresa
	FROM 
		OPENJSON(@JsonSesion)
	WITH (
		Usuario_Registro CHAR(25) '$.Usuario_Registro',
		Ip_Address CHAR(15) '$.Ip_Address',
		Hostname CHAR(60) '$.Hostname',
		Region CHAR(60) '$.Region',
		Pais VARCHAR(10) '$.Pais',		
		Org CHAR(100) '$.Org',
		Codigo_Postal CHAR(32) '$.Codigo_Postal',
		Zona_Horaria CHAR(100) '$.Zona_Horaria',
		Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa'		
	)

	BEGIN TRY
		INSERT INTO REGISTRO_SESIONES (ID_REGISTRO, USUARIO_REGISTRO, FECHA_REGISTRO, IP_ADDRESS, HOSTNAME, REGION, PAIS, 
		LOCALIZACION, ORG, CODIGO_POSTAL, ZONA_HORARIA, ID_EMPRESA)
		SELECT
			NEWID(),
			Usuario_Registro,
			Fecha_Registro,
			Ip_Address,
			Hostname,
			Region,
			Pais,
			Localizacion,
			Org,
			Codigo_Postal,
			Zona_Horaria,
			Id_Empresa
		FROM #TempRegistro_Sesiones

		IF OBJECT_ID('tempdb..#TempRegistro_Sesiones') IS NOT NULL DROP TABLE #TempRegistro_Sesiones

	END TRY
	BEGIN CATCH
		IF OBJECT_ID('tempdb..#TempRegistro_Sesiones') IS NOT NULL DROP TABLE #TempRegistro_Sesiones
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)
	END CATCH

END

GO