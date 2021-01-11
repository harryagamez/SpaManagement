CREATE PROCEDURE [dbo].[ActualizarEmpleadoServicio](
	@JsonEmpleadoServicio NVARCHAR(MAX)
)
AS 
BEGIN
	
	CREATE TABLE #TempEmpleadoServicio (Id_Empleado_Servicio INT, Id_Empresa_Servicio VARCHAR(36), Id_Empleado INT, 
	Aplicacion_Nomina DECIMAL(18,2), Usuario_Modificacion CHAR(25))

	DECLARE @FechaActual DATETIME = GETDATE()

	INSERT INTO #TempEmpleadoServicio (Id_Empleado_Servicio, Id_Empresa_Servicio, Id_Empleado, Aplicacion_Nomina, 
	Usuario_Modificacion)
	SELECT 
		Id_Empleado_Servicio, Id_Empresa_Servicio, Id_Empleado,
		Aplicacion_Nomina, Usuario_Modificacion
	FROM 
		OPENJSON(@JsonEmpleadoServicio)
	WITH (
		Id_Empleado_Servicio INT '$.Id_Empleado_Servicio', 
		Id_Empresa_Servicio VARCHAR(36) '$.Id_Empresa_Servicio',
		Id_Empleado INT '$.Id_Empleado', 
		Aplicacion_Nomina DECIMAL(18,2) '$.Aplicacion_Nomina',
		Usuario_Modificacion CHAR(25) '$.Usuario_Modificacion'
	)

	BEGIN TRY

		UPDATE EMPLEADOS_SERVICIOS SET 
			APLICACION_NOMINA = #TempEmpleadoServicio.Aplicacion_Nomina,
			FECHA_MODIFICACION = @FechaActual,
			USUARIO_MODIFICACION = #TempEmpleadoServicio.Usuario_Modificacion
		FROM EMPLEADOS_SERVICIOS
		INNER JOIN #TempEmpleadoServicio 
		ON EMPLEADOS_SERVICIOS.ID_EMPLEADO_SERVICIO = #TempEmpleadoServicio.Id_Empleado_Servicio
		AND EMPLEADOS_SERVICIOS.ID_EMPLEADO = #TempEmpleadoServicio.Id_Empleado
		AND CAST(EMPLEADOS_SERVICIOS.ID_EMPRESA_SERVICIO AS VARCHAR(36)) = #TempEmpleadoServicio.Id_Empresa_Servicio

		IF OBJECT_ID('tempdb..#TempEmpleadoServicio') IS NOT NULL DROP TABLE #TempEmpleadoServicio

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempEmpleadoServicio') IS NOT NULL DROP TABLE #TempEmpleadoServicio
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)
		
	END CATCH

END

GO