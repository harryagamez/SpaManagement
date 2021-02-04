﻿CREATE PROCEDURE [dbo].[ConsultarGastos](
	@JsonBusqueda NVARCHAR(MAX)
)
AS
BEGIN
	
	CREATE TABLE #TempBusquedaGasto(FechaDesde DATETIME, FechaHasta DATETIME, TipoGasto CHAR(15) NULL, IdEmpresa VARCHAR(36))
	
	DECLARE @FechaDesde CHAR(10)
	DECLARE @FechaHasta CHAR(10)
	DECLARE @IdEmpresa VARCHAR(36)
	DECLARE @TipoGasto CHAR(15)

	BEGIN TRY

		INSERT INTO #TempBusquedaGasto(FechaDesde, FechaHasta, TipoGasto, IdEmpresa)
		SELECT 
			JsonBusqueda.Fecha_Desde, JsonBusqueda.Fecha_Hasta, 
			JsonBusqueda.Tipo_Gasto, JsonBusqueda.Id_Empresa
		FROM OPENJSON(@JsonBusqueda) 
		WITH (
			Fecha_Desde DATETIME '$.Fecha_Desde', Fecha_Hasta DATETIME '$.Fecha_Hasta', 
			Tipo_Gasto CHAR(20) '$.Tipo_Gasto', Id_Empresa VARCHAR(36) '$.Id_Empresa'
		) AS JsonBusqueda

		SELECT 
			@FechaDesde = CONVERT(CHAR(10),FechaDesde,126),
			@FechaHasta = CONVERT(CHAR(10),FechaHasta,126),
			@TipoGasto = TipoGasto,
			@IdEmpresa = IdEmpresa
		FROM #TempBusquedaGasto		

		IF @TipoGasto IS NOT NULL BEGIN
		
			SELECT 
				ID_GASTO, RTRIM(TIPO_GASTO) AS TIPO_GASTO, RTRIM(DESCRIPCION) AS DESCRIPCION,
				VALOR, FECHA, RTRIM(ISNULL(GASTOS.ESTADO,'')) AS ESTADO, GASTOS.ID_EMPLEADO, CONCAT(RTRIM(NOMBRES),' ',RTRIM(APELLIDOS)) AS NOMBRE_EMPLEADO,
				GASTOS.FECHA_REGISTRO, GASTOS.FECHA_MODIFICACION, CAST(GASTOS.ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA, RTRIM(GASTOS.USUARIO_REGISTRO) AS USUARIO_REGISTRO, RTRIM(GASTOS.USUARIO_MODIFICACION) AS USUARIO_MODIFICACION
			FROM GASTOS 
			LEFT JOIN EMPLEADOS
			ON GASTOS.ID_EMPLEADO = EMPLEADOS.ID_EMPLEADO
			WHERE TIPO_GASTO = @TipoGasto AND CAST(GASTOS.ID_EMPRESA AS VARCHAR(36)) = @IdEmpresa
			AND CONVERT(CHAR(10),FECHA,126) BETWEEN @FechaDesde AND @FechaHasta
			ORDER BY GASTOS.FECHA_REGISTRO DESC

		END
		ELSE BEGIN

			SELECT 
				ID_GASTO, RTRIM(TIPO_GASTO) AS TIPO_GASTO, RTRIM(DESCRIPCION) AS DESCRIPCION,
				VALOR, FECHA, RTRIM(ISNULL(GASTOS.ESTADO,'')) AS ESTADO, GASTOS.ID_EMPLEADO, CONCAT(RTRIM(NOMBRES),' ',RTRIM(APELLIDOS)) AS NOMBRE_EMPLEADO,
				GASTOS.FECHA_REGISTRO, GASTOS.FECHA_MODIFICACION, CAST(GASTOS.ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA, RTRIM(GASTOS.USUARIO_REGISTRO) AS USUARIO_REGISTRO, RTRIM(GASTOS.USUARIO_MODIFICACION) AS USUARIO_MODIFICACION
			FROM GASTOS 
			LEFT JOIN EMPLEADOS
			ON GASTOS.ID_EMPLEADO = EMPLEADOS.ID_EMPLEADO
			WHERE CAST(GASTOS.ID_EMPRESA AS VARCHAR(36)) = @IdEmpresa
			AND CONVERT(CHAR(10),FECHA,126) BETWEEN @FechaDesde AND @FechaHasta
			ORDER BY GASTOS.FECHA_REGISTRO DESC

		END

		IF OBJECT_ID('tempdb..#TempBusquedaGasto') IS NOT NULL DROP TABLE #TempBusquedaGasto

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempBusquedaGasto') IS NOT NULL DROP TABLE #TempBusquedaGasto
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO