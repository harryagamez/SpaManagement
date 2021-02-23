CREATE PROCEDURE [dbo].[ConsultarBarrios](
	@IdMunicipio INT
)
AS
BEGIN
	
	SELECT * 
	FROM BARRIOS 
	WHERE ID_MUNICIPIO = @IdMunicipio

END

GO
