ALTER PROCEDURE ConsultarClientes(@IdEmpresa VARCHAR(36))
AS

BEGIN

	SELECT ID_CLIENTE,RTRIM(CEDULA) AS CEDULA,RTRIM(NOMBRES) AS NOMBRES,RTRIM(APELLIDOS) AS APELLIDOS,
	RTRIM(TELEFONO_FIJO) AS TELEFONO_FIJO,RTRIM(TELEFONO_MOVIL) AS TELEFONO_MOVIL,RTRIM(MAIL) AS MAIL,
	RTRIM(DIRECCION) AS DIRECCION,CLIENTES.ID_BARRIO,BARRIOS.NOMBRE AS BARRIO,ID_TIPO,RTRIM(ESTADO) AS ESTADO,
	CONVERT(VARCHAR(10),FECHA_REGISTRO, 120) AS FECHA_REGISTRO,FECHA_MODIFICACION,CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA 
	FROM CLIENTES INNER JOIN BARRIOS ON CLIENTES.ID_BARRIO = BARRIOS.ID_BARRIO	
	WHERE ID_EMPRESA = @IdEmpresa
	ORDER BY ID_CLIENTE ASC

END

GO