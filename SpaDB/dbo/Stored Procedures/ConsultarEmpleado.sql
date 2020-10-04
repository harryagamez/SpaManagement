CREATE PROCEDURE ConsultarEmpleado(
	@CedulaEmpleado VARCHAR(15), 
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN

SELECT 
		ID_EMPLEADO,
		RTRIM(CEDULA) AS CEDULA, 
		CAST(ID_TIPOPAGO AS VARCHAR(36)) AS ID_TIPOPAGO, 
		MONTO, 
		RTRIM(NOMBRES) AS NOMBRES,
		RTRIM(APELLIDOS) AS APELLIDOS,
		RTRIM(TELEFONO_FIJO) AS TELEFONO_FIJO,
		RTRIM(TELEFONO_MOVIL) AS TELEFONO_MOVIL,
		RTRIM(DIRECCION) AS DIRECCION,
		EMPLEADOS.ID_BARRIO,
		FECHA_NACIMIENTO,
		RTRIM(ESTADO_CIVIL) AS ESTADO_CIVIL,
		NUMERO_HIJOS,RTRIM(ESTADO) AS ESTADO,
		BARRIOS.NOMBRE AS BARRIO,
		FECHA_REGISTRO,
		FECHA_MODIFICACION,
		CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA,
		BARRIOS.ID_MUNICIPIO AS ID_MUNICIPIO,
		RTRIM(MUNICIPIOS.ID_DEPARTAMENTO) AS ID_DEPARTAMENTO,
		RTRIM(LOGO_BASE64) AS LOGO_BASE64
	FROM EMPLEADOS 
	INNER JOIN BARRIOS 
	ON EMPLEADOS.ID_BARRIO = BARRIOS.ID_BARRIO
	INNER JOIN MUNICIPIOS
	ON BARRIOS.ID_MUNICIPIO = MUNICIPIOS.ID_MUNICIPIO
	WHERE ID_EMPRESA = @IdEmpresa AND CEDULA = @CedulaEmpleado

END

GO