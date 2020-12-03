CREATE PROCEDURE [dbo].[AsignarEmpleadoServicio](
	@JsonEmpleadoServicio NVARCHAR(MAX)
)
AS
BEGIN
	
	DECLARE @FechaActual DATETIME = GETDATE()
	DECLARE @UsuarioSistema CHAR(25)

	CREATE TABLE #TempEmpleadoServicio(Id_Empleado_Servicio INT, Id_Empresa_Servicio VARCHAR(36), Id_Servicio INT, Id_Empleado INT, Usuario_Creacion CHAR(25))

	INSERT INTO #TempEmpleadoServicio (Id_Empleado_Servicio, Id_Empresa_Servicio, Id_Servicio, Id_Empleado, Usuario_Creacion)
	SELECT 
		JSON_VALUE (C.value, '$.Id_Empleado_Servicio') AS Id_Empleado_Servicio,
		JSON_VALUE (C.value, '$.Id_Empresa_Servicio') AS Id_Empresa_Servicio,
		JSON_VALUE (C.value, '$.Id_Servicio') AS Id_Servicio, 
		JSON_VALUE (C.value, '$.Id_Empleado') AS Id_Empleado,
		JSON_VALUE (C.value, '$.Usuario_Creacion') AS Usuario_Creacion
	FROM OPENJSON(@JsonEmpleadoServicio) AS C

	BEGIN TRY

		SET @UsuarioSistema = (SELECT TOP 1 Usuario_Creacion FROM #TempEmpleadoServicio)

		INSERT INTO EMPLEADOS_SERVICIOS (ID_EMPRESA_SERVICIO, ID_SERVICIO, ID_EMPLEADO, 
		FECHA_CREACION, USUARIO_CREACION) 
		SELECT 
			Id_Empresa_Servicio, Id_Servicio, Id_Empleado,
			@FechaActual, @UsuarioSistema
		FROM #TempEmpleadoServicio

		IF OBJECT_ID('tempdb..#TempEmpleadoServicio') IS NOT NULL DROP TABLE #TempEmpleadoServicio

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempEmpleadoServicio') IS NOT NULL DROP TABLE #TempEmpleadoServicio
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)
		
	END CATCH
END

GO