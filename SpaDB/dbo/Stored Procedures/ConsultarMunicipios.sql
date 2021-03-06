﻿CREATE PROCEDURE [dbo].[ConsultarMunicipios]
AS
BEGIN
	
	SELECT 
		ID_MUNICIPIO,
		RTRIM(MUNICIPIOS.NOMBRE) AS NOMBRE,
		RTRIM(MUNICIPIOS.ID_DEPARTAMENTO) AS ID_DEPARTAMENTO,
		RTRIM(DEPARTAMENTOS.NOMBRE) AS NOMBRE_DEPARTAMENTO
	FROM MUNICIPIOS
	INNER JOIN DEPARTAMENTOS
	ON MUNICIPIOS.ID_DEPARTAMENTO = DEPARTAMENTOS.ID_DEPARTAMENTO
	ORDER BY NOMBRE

END

GO