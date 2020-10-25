﻿CREATE PROCEDURE ConsultarTipoServicios
AS
BEGIN

	SELECT 
		ID_TIPOSERVICIO,
		RTRIM(TIPO_SERVICIO.NOMBRE) AS NOMBRE,
		RTRIM(TIPO_SERVICIO.DESCRIPCION) AS DESCRIPCION,
		FECHA_REGISTRO,
		FECHA_MODIFICACION,
		RTRIM(TIPO_SERVICIO.ID_CATEGORIA_SERVICIO) AS ID_CATEGORIA_SERVICIO,
		RTRIM(CATEGORIA_SERVICIOS.NOMBRE) AS NOMBRE_CATEGORIA_SERVICIO
	FROM TIPO_SERVICIO 
	INNER JOIN CATEGORIA_SERVICIOS
	ON TIPO_SERVICIO.ID_CATEGORIA_SERVICIO = CATEGORIA_SERVICIOS.ID_CATEGORIA_SERVICIO
	ORDER BY NOMBRE ASC

END

GO