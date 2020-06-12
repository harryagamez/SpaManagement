CREATE PROCEDURE RegistrarActualizarClientes(@JsonCliente NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempCliente(Id_Cliente INT, Cedula CHAR(15) COLLATE SQL_Latin1_General_CP1_CI_AS, Nombres CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Apellidos CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, Telefono_Fijo CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Telefono_Movil CHAR(12) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Mail CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, Direccion CHAR(25) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Barrio INT, Fecha_Nacimiento SMALLDATETIME, Id_Tipo INT, 
	Estado CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Usuario_Creacion INT)

	INSERT INTO #TempCliente (Id_Cliente, Cedula, Nombres, Apellidos, Telefono_Fijo, Telefono_Movil, Mail, Direccion, Id_Barrio, Fecha_Nacimiento, Id_Tipo, Estado, 
	Id_Empresa, Id_Usuario_Creacion)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Cliente') AS Id_Cliente,
		JSON_VALUE (C.value, '$.Cedula') AS Cedula, 
		JSON_VALUE (C.value, '$.Nombres') AS Nombres, 
		JSON_VALUE (C.value, '$.Apellidos') AS Apellidos,
		JSON_VALUE (C.value, '$.Telefono_Fijo') AS Telefono_Fijo,
		JSON_VALUE (C.value, '$.Telefono_Movil') AS Telefono_Movil,
		JSON_VALUE (C.value, '$.Mail') AS Mail,
		JSON_VALUE (C.value, '$.Direccion') AS Direccion,
		JSON_VALUE (C.value, '$.Id_Barrio') AS Id_Barrio,
		JSON_VALUE (C.value, '$.Fecha_Nacimiento') AS Fecha_Nacimiento,
		JSON_VALUE (C.value, '$.Id_Tipo') AS Id_Tipo,
		JSON_VALUE (C.value, '$.Estado') AS Estado,
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa,
		JSON_VALUE (C.value, '$.Id_Usuario_Creacion') AS Id_Usuario_Creacion
	FROM OPENJSON(@JsonCliente) AS C

	BEGIN TRY
		
		MERGE CLIENTES AS TARGET
		USING #TempCliente AS SOURCE
		ON TARGET.ID_CLIENTE = SOURCE.Id_Cliente AND TARGET.CEDULA = SOURCE.Cedula AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
		WHEN MATCHED THEN
			UPDATE SET TARGET.NOMBRES = SOURCE.Nombres, TARGET.APELLIDOS = SOURCE.Apellidos, TARGET.TELEFONO_FIJO = SOURCE.Telefono_Fijo,
			TARGET.TELEFONO_MOVIL = SOURCE.Telefono_Movil, TARGET.MAIL = SOURCE.Mail, TARGET.DIRECCION = SOURCE.Direccion,
			TARGET.ID_BARRIO = SOURCE.Id_Barrio, TARGET.FECHA_NACIMIENTO = SOURCE.Fecha_Nacimiento, TARGET.ID_TIPO = SOURCE.Id_Tipo,
			TARGET.ESTADO = SOURCE.Estado, TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (CEDULA, NOMBRES, APELLIDOS, TELEFONO_FIJO, TELEFONO_MOVIL, MAIL, DIRECCION, ID_BARRIO, FECHA_NACIMIENTO, ID_TIPO,
			ESTADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA, ID_USUARIO_CREACION)
			VALUES (SOURCE.Cedula, SOURCE.Nombres, SOURCE.Apellidos, SOURCE.Telefono_Fijo, SOURCE.Telefono_Movil, SOURCE.Mail,
			SOURCE.Direccion, SOURCE.Id_Barrio, SOURCE.Fecha_Nacimiento, SOURCE.Id_Tipo, SOURCE.Estado, GETDATE(), GETDATE(),
			SOURCE.Id_Empresa, SOURCE.Id_Usuario_Creacion)
		OUTPUT $action, inserted.*;

		IF OBJECT_ID('tempdb..#TempCliente') IS NOT NULL DROP TABLE #TempCliente

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempCliente') IS NOT NULL DROP TABLE #TempCliente

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO