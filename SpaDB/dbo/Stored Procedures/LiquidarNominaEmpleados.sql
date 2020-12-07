CREATE PROCEDURE [dbo].[LiquidarNominaEmpleados](
	@JsonAplicacionNomina NVARCHAR(MAX)
)
AS
BEGIN

	SET XACT_ABORT, NOCOUNT ON
	
	DECLARE @IdEmpresa AS VARCHAR(36)
	DECLARE @FechaNomina AS DATETIME
	DECLARE @TotalNomina AS DECIMAL(18,2)
	DECLARE @UsuarioSistema CHAR(25)
	DECLARE @Mensaje AS VARCHAR(200)	
	DECLARE @TipoNomina CHAR(15)
	DECLARE @FechaActual AS DATETIME =  GETDATE()
	DECLARE @MensajePrestamos VARCHAR(100)
	DECLARE @MensajePagoNomina VARCHAR(100)

	SELECT 
		@IdEmpresa = Id_Empresa, 
		@FechaNomina = Fecha_Nomina, 
		@TotalNomina = Total_Nomina,
		@UsuarioSistema = Usuario_Registro
	FROM 
		OPENJSON(@JsonAplicacionNomina)
	WITH (
		Id_Empresa VARCHAR(36) '$.Id_Empresa',
		Fecha_Nomina DATETIME '$.Fecha_Nomina',
		Total_Nomina DECIMAL(18,2) '$.Total_Nomina',
		Usuario_Registro CHAR(25) '$.Usuario_Registro'
	)
	
	SET @TipoNomina = (
		SELECT 
			TOP 1 VALOR_PROPIEDAD 
		FROM EMPRESA_PROPIEDADES 
		WHERE ID_EMPRESA = @IdEmpresa 
		AND (VALOR_PROPIEDAD = 'MENSUAL' 
		OR VALOR_PROPIEDAD = 'QUINCENAL' 
		OR VALOR_PROPIEDAD = 'DIARIO' 
		OR VALOR_PROPIEDAD = 'POR_SERVICIOS')
	)

	IF (@TipoNomina IS NULL) BEGIN
		SET @Mensaje = 'Para poder DECIMAL(18,2)izar esta tarea debe configurar el tipo de nómina de la empresa'
		RAISERROR (@Mensaje, 16, 1)		
		RETURN
	END

	CREATE TABLE #TempLiquidaciones_Empleados (Fecha DATETIME, Id_Empleado INT, Subtotal  DECIMAL(18,2), Total_Prestamos  DECIMAL(18,2), Total_Pagado  DECIMAL(18,2), Anio INT, 
	Mes INT, Quincena INT, Dia SMALLDATETIME, Id_Empresa VARCHAR(36))

	IF(@TipoNomina = 'MENSUAL' OR @TipoNomina = 'POR_SERVICIOS') BEGIN

		INSERT INTO #TempLiquidaciones_Empleados (Id_Empleado, Subtotal, Total_Prestamos, Total_Pagado, Anio, Mes, Id_Empresa)
		SELECT
			Liquidacion.Id_Empleado,
			Liquidacion.Subtotal,
			Liquidacion.Total_Prestamos,
			Liquidacion.Total_Pagado,
			YEAR(@FechaNomina),
			MONTH(@FechaNomina),
			@IdEmpresa
		FROM
			OPENJSON(@JsonAplicacionNomina, '$')
		WITH (
			Empleados NVARCHAR(MAX) '$.Empleados' AS JSON
		) AS JsonAplicacionNomina
		CROSS APPLY OPENJSON(JsonAplicacionNomina.Empleados)
		WITH (
			Id_Empleado INT '$.Id_Empleado',
			Subtotal DECIMAL(18,2) '$.Subtotal',
			Total_Prestamos DECIMAL(18,2) '$.Total_Prestamos',
			Total_Pagado DECIMAL(18,2) '$.Total_Pagado'
		) Liquidacion	

	END

	IF(@TipoNomina = 'QUINCENAL') BEGIN
	
		IF(DAY(@FechaNomina) <= 15) BEGIN

			INSERT INTO #TempLiquidaciones_Empleados (Id_Empleado, Subtotal, Total_Prestamos, Total_Pagado, Anio, Mes, Quincena, Id_Empresa)
			SELECT
				Liquidacion.Id_Empleado,
				Liquidacion.Subtotal,
				Liquidacion.Total_Prestamos,
				Liquidacion.Total_Pagado,
				YEAR(@FechaNomina),
				MONTH(@FechaNomina),
				1,
				@IdEmpresa
			FROM
				OPENJSON(@JsonAplicacionNomina, '$')
			WITH (
				Empleados NVARCHAR(MAX) '$.Empleados' AS JSON
			) AS JsonAplicacionNomina
			CROSS APPLY OPENJSON(JsonAplicacionNomina.Empleados)
			WITH (
				Id_Empleado INT '$.Id_Empleado',
				Subtotal DECIMAL(18,2) '$.Subtotal',
				Total_Prestamos DECIMAL(18,2) '$.Total_Prestamos',
				Total_Pagado DECIMAL(18,2) '$.Total_Pagado'
			) Liquidacion			

		END

		IF(DAY(@FechaNomina) > 15) BEGIN
		
			INSERT INTO #TempLiquidaciones_Empleados (Id_Empleado, Subtotal, Total_Prestamos, Total_Pagado, Anio, Mes, Quincena, Id_Empresa)
			SELECT
				Liquidacion.Id_Empleado,
				Liquidacion.Subtotal,
				Liquidacion.Total_Prestamos,
				Liquidacion.Total_Pagado,
				YEAR(@FechaNomina),
				MONTH(@FechaNomina),
				2,
				@IdEmpresa
			FROM
				OPENJSON(@JsonAplicacionNomina, '$')
			WITH (
				Empleados NVARCHAR(MAX) '$.Empleados' AS JSON
			) AS JsonAplicacionNomina
			CROSS APPLY OPENJSON(JsonAplicacionNomina.Empleados)
			WITH (
				Id_Empleado INT '$.Id_Empleado',
				Subtotal DECIMAL(18,2) '$.Subtotal',
				Total_Prestamos DECIMAL(18,2) '$.Total_Prestamos',
				Total_Pagado DECIMAL(18,2) '$.Total_Pagado'
			) Liquidacion
			
		END
	
	END

	IF(@TipoNomina = 'DIARIA') BEGIN
	
		INSERT INTO #TempLiquidaciones_Empleados (Id_Empleado, Subtotal, Total_Prestamos, Total_Pagado, Anio, Mes, Dia, Id_Empresa)
		SELECT
			Liquidacion.Id_Empleado,
			Liquidacion.Subtotal,
			Liquidacion.Total_Prestamos,
			Liquidacion.Total_Pagado,
			YEAR(@FechaNomina),
			MONTH(@FechaNomina),
			@FechaNomina,
			@IdEmpresa
		FROM
			OPENJSON(@JsonAplicacionNomina, '$')
		WITH (
			Empleados NVARCHAR(MAX) '$.Empleados' AS JSON
		) AS JsonAplicacionNomina
		CROSS APPLY OPENJSON(JsonAplicacionNomina.Empleados)
		WITH (
			Id_Empleado INT '$.Id_Empleado',
			Subtotal DECIMAL(18,2) '$.Subtotal',
			Total_Prestamos DECIMAL(18,2) '$.Total_Prestamos',
			Total_Pagado DECIMAL(18,2) '$.Total_Pagado'
		) Liquidacion		
	
	END	

	BEGIN TRY

		BEGIN TRANSACTION Tn_LiquidarNomina

			INSERT INTO LIQUIDACIONES (FECHA, ID_EMPLEADO, SUBTOTAL, TOTAL_PRESTAMOS, TOTAL_PAGADO, ANIO, MES, QUINCENA, DIA, 
			ID_EMPRESA, USUARIO_REGISTRO)
			SELECT 
				@FechaActual, Id_Empleado, Subtotal, Total_Prestamos, 
				Total_Pagado, Anio, Mes, Quincena, Dia, Id_Empresa,
				@UsuarioSistema
			FROM #TempLiquidaciones_Empleados
			WHERE Total_Pagado > 0

			IF(@TipoNomina = 'POR_SERVICIOS') BEGIN
		
				UPDATE Agenda 
					SET ESTADO = 'LIQUIDADA', 
					FECHA_MODIFICACION = @FechaActual,
					USUARIO_MODIFICACION = @UsuarioSistema
				FROM AGENDA Agenda
				INNER JOIN #TempLiquidaciones_Empleados LiquidacionesEmpleados
				ON LiquidacionesEmpleados.Id_Empleado = Agenda.ID_EMPLEADO 
				AND LiquidacionesEmpleados.Id_Empresa = Agenda.ID_EMPRESA
				WHERE YEAR(FECHA_INICIO) = YEAR(@FechaNomina) 
				AND MONTH(FECHA_INICIO) = MONTH(@FechaNomina)
		
			END

			UPDATE Gastos 
				SET ESTADO = 'LIQUIDADO', 
				FECHA_MODIFICACION = @FechaActual,
				USUARIO_MODIFICACION = @UsuarioSistema
			FROM GASTOS Gastos
			INNER JOIN #TempLiquidaciones_Empleados LiquidacionesEmpleados
			ON LiquidacionesEmpleados.Id_Empleado = Gastos.ID_EMPLEADO 
			AND LiquidacionesEmpleados.Id_Empresa = Gastos.ID_EMPRESA
			WHERE LiquidacionesEmpleados.Subtotal >= LiquidacionesEmpleados.Total_Prestamos

			SET @MensajePrestamos = 'Excedente del valor de los prestamos el cual no pudo ser cancelado en ésta liquidación'

			INSERT INTO GASTOS (TIPO_GASTO, DESCRIPCION, VALOR, FECHA, ESTADO, ID_EMPLEADO, FECHA_REGISTRO, FECHA_MODIFICACION, ID_EMPRESA )
			SELECT 
				'PRESTAMOS', @MensajePrestamos, ABS(Total_Pagado), 
				@FechaActual, 'ASIGNADO', Id_Empleado, 
				@FechaActual, @FechaActual, @IdEmpresa
			FROM #TempLiquidaciones_Empleados
			WHERE Total_Pagado < 0

			SET @MensajePagoNomina = 'Liquidación de nómina la cual fue abonada en su totalidad'

			INSERT INTO GASTOS (TIPO_GASTO, DESCRIPCION, VALOR, FECHA, ESTADO, ID_EMPLEADO, FECHA_REGISTRO, FECHA_MODIFICACION, 
			ID_EMPRESA, USUARIO_REGISTRO, USUARIO_MODIFICACION)
			SELECT 
				'NOMINA', @MensajePagoNomina, Total_Pagado, 
				@FechaNomina, 'LIQUIDADO', Id_Empleado, @FechaActual, 
				@FechaActual, @IdEmpresa, @UsuarioSistema, @UsuarioSistema
			FROM #TempLiquidaciones_Empleados
			WHERE Total_Pagado > 0

			UPDATE CAJA_MENOR 
				SET ACUMULADO = (CAJA_MENOR.ACUMULADO - ISNULL(@TotalNomina, 0))
			WHERE ID_EMPRESA = @IdEmpresa

		COMMIT TRANSACTION Tn_LiquidarNomina

		IF OBJECT_ID('tempdb..#TempLiquidaciones_Empleados') IS NOT NULL DROP TABLE #TempLiquidaciones_Empleados
	
	END TRY

	BEGIN CATCH	
		
		IF OBJECT_ID('tempdb..#TempLiquidaciones_Empleados') IS NOT NULL DROP TABLE #TempLiquidaciones_Empleados
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION Tn_LiquidarNomina
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)	
		
	END CATCH	

END

GO