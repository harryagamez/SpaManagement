﻿CREATE PROCEDURE [dbo].[RegistrarClientes](
	@JsonClientes NVARCHAR(MAX)
)
AS
BEGIN

	DECLARE @IdMunicpio INT
	DECLARE @IdBarrio INT
	DECLARE @FechaActual DATETIME

	CREATE TABLE #TempClientes (Id_Cliente INT, Cedula CHAR(15) COLLATE DATABASE_DEFAULT, Nombres CHAR(60) COLLATE DATABASE_DEFAULT, 
	Apellidos CHAR(60) COLLATE DATABASE_DEFAULT, Mail CHAR(60) COLLATE DATABASE_DEFAULT, Direccion CHAR(25) COLLATE DATABASE_DEFAULT, 
	Telefono_Movil CHAR(12) COLLATE DATABASE_DEFAULT, Fecha_Nacimiento DATETIME, Id_Tipo INT, Estado CHAR(10) COLLATE DATABASE_DEFAULT, 
	Id_Empresa UNIQUEIDENTIFIER, Usuario_Registro CHAR(25))

	SET @FechaActual = GETDATE()
	SET @IdMunicpio = (SELECT TOP 1 ID_MUNICIPIO FROM MUNICIPIOS WHERE (RTRIM(NOMBRE) = 'MEDELLIN' OR RTRIM(NOMBRE) = 'MEDELLÍN'))
	SET @IdBarrio = (SELECT TOP 1 ID_BARRIO FROM BARRIOS WHERE ID_MUNICIPIO = @IdMunicpio)

	INSERT INTO #TempClientes(Id_Cliente, Cedula, Nombres, Apellidos, Mail, Direccion, Telefono_Movil, 
	Fecha_Nacimiento, Id_Tipo, Estado, Id_Empresa, Usuario_Registro)
	SELECT 
		Id_Cliente, Cedula, Nombres, Apellidos, Mail, Direccion, 
		Telefono_Movil, Fecha_Nacimiento, Id_Tipo, Estado, 
		Id_Empresa, Usuario_Registro
	FROM 
		OPENJSON(@JsonClientes)
	WITH (
		Id_Cliente INT '$.Id_Cliente', Cedula CHAR(15) '$.Cedula',
		Nombres CHAR(60) '$.Nombres', Apellidos CHAR(60) '$.Apellidos',
		Mail CHAR(60) '$.Mail', Direccion CHAR(25) '$.Direccion',
		Telefono_Movil CHAR(12) '$.Telefono_Movil', Fecha_Nacimiento DATETIME '$.Fecha_Nacimiento',
		Id_Tipo INT '$.Id_Tipo', Estado CHAR(10) '$.Estado', Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa',
		Usuario_Registro CHAR(25) '$.Usuario_Registro'
	)

	MERGE CLIENTES AS TARGET
	USING #TempClientes AS SOURCE
	ON TARGET.CEDULA = SOURCE.Cedula 
	AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa
	WHEN MATCHED THEN
		UPDATE SET 
			TARGET.NOMBRES = SOURCE.Nombres, 
			TARGET.APELLIDOS = SOURCE.Apellidos,
			TARGET.MAIL = SOURCE.Mail, 
			TARGET.DIRECCION = SOURCE.Direccion, 
			TARGET.TELEFONO_MOVIL = SOURCE.Telefono_Movil,
			TARGET.FECHA_NACIMIENTO = SOURCE.Fecha_Nacimiento,
			TARGET.ID_TIPO = SOURCE.Id_Tipo,
			TARGET.ESTADO = SOURCE.Estado,
			TARGET.USUARIO_MODIFICACION = SOURCE.Usuario_Registro,
			TARGET.FECHA_MODIFICACION = @FechaActual
	WHEN NOT MATCHED THEN
		INSERT (CEDULA, NOMBRES, APELLIDOS, TELEFONO_MOVIL, MAIL, DIRECCION, ID_BARRIO, FECHA_NACIMIENTO, 
		ID_TIPO, ESTADO, FECHA_REGISTRO, USUARIO_REGISTRO, ID_EMPRESA)
		VALUES (SOURCE.Cedula, SOURCE.Nombres, SOURCE.Apellidos, SOURCE.Telefono_Movil, SOURCE.Mail, SOURCE.Direccion, 
		@IdBarrio, SOURCE.Fecha_Nacimiento, SOURCE.Id_Tipo, SOURCE.Estado, @FechaActual, SOURCE.Usuario_Registro,
		SOURCE.Id_Empresa);

END

GO
