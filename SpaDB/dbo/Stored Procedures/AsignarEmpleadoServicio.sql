CREATE PROCEDURE AsignarEmpleadoServicio(@JsonEmpleadoServicio NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempEmpleadoServicio(Id_Empleado_Servicio INT, Id_Servicio INT, Id_Empleado INT)

	INSERT INTO #TempEmpleadoServicio (Id_Empleado_Servicio, Id_Servicio, Id_Empleado)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Empleado_Servicio') AS Id_Empleado_Servicio,
		JSON_VALUE (C.value, '$.Id_Servicio') AS Id_Servicio, 
		JSON_VALUE (C.value, '$.Id_Empleado') AS Id_Empleado			
	FROM OPENJSON(@JsonEmpleadoServicio) AS C
	BEGIN TRY
	INSERT INTO EMPLEADOS_SERVICIOS (ID_SERVICIO, ID_EMPLEADO) SELECT Id_Servicio, Id_Empleado FROM #TempEmpleadoServicio
	END TRY
		
	
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempEmpleadoServicio') IS NOT NULL DROP TABLE #TempEmpleadoServicio

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)
		
	END CATCH
END

GO