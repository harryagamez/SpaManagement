﻿CREATE PROCEDURE ConsultarBarrios(@IdMunicipio INT)
AS

BEGIN
	
	SELECT 
		* 
	FROM BARRIOS 
	WHERE ID_MUNICIPIO = @IdMunicipio

END

GO
