CREATE PROCEDURE RegistrarActualizarEmpleado(@JsonEmpleado NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempEmpleado(Id_Empleado INT, Cedula CHAR(15) COLLATE SQL_Latin1_General_CP1_CI_AS, Nombres CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Apellidos CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, Telefono_Fijo CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Telefono_Movil CHAR(12) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Id_TipoPago VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS, Direccion CHAR(25) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Barrio INT, Fecha_Nacimiento SMALLDATETIME,
	Estado_Civil CHAR(15) COLLATE SQL_Latin1_General_CP1_CI_AS, Numero_Hijos INT, Monto REAL, Estado CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Empresa VARCHAR(36) COLLATE SQL_Latin1_General_CP1_CI_AS)

	INSERT INTO #TempEmpleado (Id_Empleado, Cedula, Nombres, Apellidos, Telefono_Fijo, Telefono_Movil, Id_TipoPago, Direccion, Id_Barrio, Fecha_Nacimiento, Estado_Civil, Numero_Hijos, Monto, Estado, 
	Id_Empresa)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Empleado') AS Id_Empleado,
		JSON_VALUE (C.value, '$.Cedula') AS Cedula, 
		JSON_VALUE (C.value, '$.Nombres') AS Nombres, 
		JSON_VALUE (C.value, '$.Apellidos') AS Apellidos,
		JSON_VALUE (C.value, '$.Telefono_Fijo') AS Telefono_Fijo,
		JSON_VALUE (C.value, '$.Telefono_Movil') AS Telefono_Movil,
		JSON_VALUE (C.value, '$.Id_TipoPago') AS Id_TipoPago,
		JSON_VALUE (C.value, '$.Direccion') AS Direccion,
		JSON_VALUE (C.value, '$.Id_Barrio') AS Id_Barrio,
		JSON_VALUE (C.value, '$.Fecha_Nacimiento') AS Fecha_Nacimiento,
		JSON_VALUE (C.value, '$.Estado_Civil') AS Estado_Civil,
		JSON_VALUE (C.value, '$.Numero_Hijos') AS Numero_Hijos,
		JSON_VALUE (C.value, '$.Monto') AS Monto,
		JSON_VALUE (C.value, '$.Estado') AS Estado,
		JSON_VALUE (C.value, '$.Id_Empresa') AS Id_Empresa		
	FROM OPENJSON(@JsonEmpleado) AS C

	BEGIN TRY
		
		MERGE EMPLEADOS AS TARGET
		USING #TempEmpleado AS SOURCE
		ON TARGET.ID_EMPLEADO = SOURCE.Id_Empleado AND TARGET.CEDULA = SOURCE.Cedula AND TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
		WHEN MATCHED THEN
			UPDATE SET TARGET.NOMBRES = SOURCE.Nombres, TARGET.APELLIDOS = SOURCE.Apellidos, TARGET.TELEFONO_FIJO = SOURCE.Telefono_Fijo,
			TARGET.TELEFONO_MOVIL = SOURCE.Telefono_Movil, TARGET.ID_TIPOPAGO = SOURCE.Id_TipoPago, TARGET.DIRECCION = SOURCE.Direccion,
			TARGET.ID_BARRIO = SOURCE.Id_Barrio, TARGET.FECHA_NACIMIENTO = SOURCE.Fecha_Nacimiento, TARGET.ESTADO_CIVIL = SOURCE.Estado_Civil,
			TARGET.NUMERO_HIJOS = SOURCE.Numero_Hijos, TARGET.MONTO = SOURCE.Monto, TARGET.ESTADO = SOURCE.Estado, TARGET.FECHA_MODIFICACION = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (CEDULA, NOMBRES, APELLIDOS, TELEFONO_FIJO, TELEFONO_MOVIL, ID_TIPOPAGO, DIRECCION, ID_BARRIO, FECHA_NACIMIENTO, ESTADO_CIVIL,
			NUMERO_HIJOS, MONTO, ESTADO, FECHA_REGISTRO, ID_EMPRESA)
			VALUES (SOURCE.Cedula, SOURCE.Nombres, SOURCE.Apellidos, SOURCE.Telefono_Fijo, SOURCE.Telefono_Movil, SOURCE.Id_TipoPago,
			SOURCE.Direccion, SOURCE.Id_Barrio, SOURCE.Fecha_Nacimiento, SOURCE.Estado_Civil, SOURCE.Numero_Hijos, SOURCE.Monto, SOURCE.Estado, GETDATE(),
			SOURCE.Id_Empresa);

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempEmpleado') IS NOT NULL DROP TABLE #TempEmpleado

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO