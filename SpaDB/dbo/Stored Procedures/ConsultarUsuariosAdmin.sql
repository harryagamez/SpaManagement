CREATE PROCEDURE [dbo].[ConsultarUsuariosAdmin]
AS
BEGIN

CREATE TABLE #TempUsuarios(Id_Usuario INT, Nombre CHAR(25) COLLATE SQL_Latin1_General_CP1_CI_AS, Contrasenia NVARCHAR(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Perfil CHAR(15) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Nombre_Empresa CHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS,
	Codigo_Integracion VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Fecha_Registro DATETIME, Fecha_Modificacion DATETIME, Verificado BIT, Mail CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS,
	Logo_Base64 NVARCHAR(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS)

	CREATE TABLE #TempMenuUsuarios (Id_Menu_Usuario VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Usuario INT, Id_Menu INT, Estado BIT,  
	Fecha_Registro DATETIME, Fecha_Modificacion DATETIME)

	INSERT INTO #TempUsuarios (Id_Usuario, Nombre, Contrasenia, Perfil, Id_Empresa, Nombre_Empresa, Codigo_Integracion, Fecha_Registro, Fecha_Modificacion, Verificado, Mail, Logo_Base64)	
	SELECT 
		USUARIOS.ID_USUARIO, RTRIM(USUARIOS.NOMBRE) AS NOMBRE,RTRIM(CONTRASENIA) AS CONTRASENIA, PERFIL, 
		CAST(EMPRESA.ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA, EMPRESA.NOMBRE AS NOMBRE_EMPRESA,
		CODIGO_INTEGRACION, USUARIOS.FECHA_REGISTRO,USUARIOS.FECHA_MODIFICACION, VERIFICADO, 
		ISNULL(USUARIOS.MAIL, EMPRESA.MAIL) AS MAIL, LOGO_BASE64		
	FROM USUARIOS 
	INNER JOIN EMPRESA 
	ON USUARIOS.ID_EMPRESA = EMPRESA.ID_EMPRESA	

	INSERT INTO #TempMenuUsuarios(Id_Menu_Usuario, Id_Usuario, Id_Menu, Estado, Fecha_Registro, Fecha_Modificacion)	
	SELECT 
		ID_MENU_USUARIO, MENU_USUARIOS.ID_USUARIO, ID_MENU, ESTADO,
		MENU_USUARIOS.FECHA_REGISTRO, MENU_USUARIOS.FECHA_MODIFICACION 
	FROM MENU_USUARIOS 
	INNER JOIN #TempUsuarios ON MENU_USUARIOS.ID_USUARIO = #TempUsuarios.Id_Usuario AND #TempUsuarios.Perfil <> '[MANAGER]'

	SELECT 
		Id_Usuario,RTRIM(Nombre) AS Nombre, RTRIM(Contrasenia) AS Contrasenia, RTRIM(Perfil) AS Perfil, 
		Id_Empresa, RTRIM(Nombre_Empresa) AS Nombre_Empresa, RTRIM(Codigo_Integracion) AS Codigo_Integracion, Fecha_Registro, Fecha_Modificacion,
		Verificado,RTRIM(Mail) AS Mail,RTRIM(Logo_Base64) AS Logo_Base64
	FROM #TempUsuarios 
	ORDER BY Nombre

	SELECT 
		#TempMenuUsuarios.Id_Menu_Usuario, #TempMenuUsuarios.Id_Usuario, 
		#TempMenuUsuarios.Id_Menu, #TempMenuUsuarios.Estado, #TempMenuUsuarios.Fecha_Registro, 
		#TempMenuUsuarios.Fecha_Modificacion, MENU.DESCRIPCION
	FROM #TempMenuUsuarios
	INNER JOIN MENU 
	ON MENU.ID_MENU = #TempMenuUsuarios.Id_Menu
	ORDER BY MENU.DESCRIPCION

	IF OBJECT_ID('tempdb..#TempUsuarios') IS NOT NULL DROP TABLE #TempUsuarios
	IF OBJECT_ID('tempdb..#TempMenuUsuarios') IS NOT NULL DROP TABLE #TempMenuUsuarios

END

GO