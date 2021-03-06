CREATE PROCEDURE [dbo].[ConsultarCajaMenor](
	@IdEmpresa VARCHAR(36)
)
AS
BEGIN

	DECLARE @FechaActual SMALLDATETIME
	DECLARE @Anio INT
	DECLARE @Mes INT

	SET @FechaActual = GETDATE()
	SET @Anio = YEAR(GETDATE())
	SET @Mes = MONTH(GETDATE())

	SELECT
        ID_REGISTRO,ANIO,MES,CONVERT(nvarchar(10),DIA,23) AS DIA, 
		QUINCENA, SALDO_INICIAL, ACUMULADO, FECHA_REGISTRO, 
		FECHA_MODIFICACION, CAST(ID_EMPRESA AS VARCHAR(36)) AS ID_EMPRESA	    
	FROM CAJA_MENOR 
    WHERE (ID_EMPRESA  = @IdEmpresa AND ANIO = @Anio AND MES = @Mes AND DIA IS NULL) 
	OR (ID_EMPRESA  = @IdEmpresa AND CONVERT(date, DIA) = CONVERT(date, @FechaActual))
	ORDER BY FECHA_MODIFICACION DESC

 END

 GO

 