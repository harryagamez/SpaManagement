CREATE PROCEDURE ConsultarEmpleados(@IdEmpresa VARCHAR(36))
AS

BEGIN

	SELECT ID_EMPLEADO,RTRIM(CEDULA) AS CEDULA, CAST(ID_TIPOPAGO AS VARCHAR(36)), RTRIM(NOMBRES) AS NOMBRES,RTRIM(APELLIDOS) AS APELLIDOS,
	RTRIM(TELEFONO_FIJO) AS TELEFONO_FIJO,RTRIM(TELEFONO_MOVIL) AS TELEFONO_MOVIL,
	RTRIM(DIRECCION) AS DIRECCION,EMPLEADOS.ID_BARRIO, FECHA_NACIMIENTO, RTRIM(ESTADO_CIVIL) AS ESTADO_CIVIL, NUMERO_HIJOS, BARRIOS.NOMBRE AS BARRIO, RTRIM(ESTADO) AS ESTADO,
	CONVERT(VARCHAR(10),FECHA_REGISTRO, 120) AS FECHA_REGISTRO,FECHA_MODIFICACION,CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA,
	(SELECT ID_MUNICIPIO FROM BARRIOS WHERE ID_BARRIO = EMPLEADOS.ID_BARRIO) AS ID_MUNICIPIO
	FROM EMPLEADOS INNER JOIN BARRIOS ON EMPLEADOS.ID_BARRIO = BARRIOS.ID_BARRIO	
	WHERE ID_EMPRESA = @IdEmpresa
	ORDER BY ID_EMPLEADO ASC

END

GO