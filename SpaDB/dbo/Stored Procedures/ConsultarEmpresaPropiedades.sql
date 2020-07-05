CREATE PROCEDURE ConsultarEmpresaPropiedades(@IdEmpresa NVARCHAR(MAX))
AS
BEGIN
	
	IF @IdEmpresa = '00000000-0000-0000-0000-000000000000' BEGIN
		SELECT 
			RTRIM(ISNULL(ID_EMPRESA_PROPIEDAD, '00000000-0000-0000-0000-000000000000')) AS ID_EMPRESA_PROPIEDAD,
			RTRIM(ID_EMPRESA) AS ID_EMPRESA,
			RTRIM(ISNULL(EMPRESA_PROPIEDADES.ID_SISTEMA_PROPIEDAD,'00000000-0000-0000-0000-000000000000')) AS ID_SISTEMA_PROPIEDAD,
			RTRIM(VALOR_PROPIEDAD) AS VALOR_PROPIEDAD,
			RTRIM(CODIGO) AS CODIGO
		FROM EMPRESA_PROPIEDADES
		INNER JOIN SISTEMA_PROPIEDADES
		ON SISTEMA_PROPIEDADES.ID_SISTEMA_PROPIEDAD = EMPRESA_PROPIEDADES.ID_SISTEMA_PROPIEDAD
	END	
	ELSE BEGIN
		SELECT 
			RTRIM(ISNULL(ID_EMPRESA_PROPIEDAD, '00000000-0000-0000-0000-000000000000')) AS ID_EMPRESA_PROPIEDAD,
			RTRIM(ID_EMPRESA) AS ID_EMPRESA,
			RTRIM(ISNULL(EMPRESA_PROPIEDADES.ID_SISTEMA_PROPIEDAD,'00000000-0000-0000-0000-000000000000')) AS ID_SISTEMA_PROPIEDAD,
			RTRIM(VALOR_PROPIEDAD) AS VALOR_PROPIEDAD,
			RTRIM(CODIGO) AS CODIGO
		FROM EMPRESA_PROPIEDADES
		INNER JOIN SISTEMA_PROPIEDADES
		ON SISTEMA_PROPIEDADES.ID_SISTEMA_PROPIEDAD = EMPRESA_PROPIEDADES.ID_SISTEMA_PROPIEDAD
		WHERE ID_EMPRESA IN (SELECT VALUE FROM STRING_SPLIT(@IdEmpresa,','))
	END

END

GO