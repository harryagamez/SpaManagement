CREATE PROCEDURE GuardarEmpresa(@JsonEmpresa NVARCHAR(MAX))
AS
BEGIN
	
	CREATE TABLE #TempEmpresa(Id_Empresa VARCHAR(36),Nombre CHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS, Direccion CHAR(60) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Telefono_Fijo CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Telefono_Movil CHAR(12) COLLATE SQL_Latin1_General_CP1_CI_AS, Mail CHAR(50) COLLATE SQL_Latin1_General_CP1_CI_AS, 
	Logo NVARCHAR(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS, Descripcion CHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_SedePrincipal VARCHAR(36), Id_Categoria_Servicio VARCHAR(36),
	Estado CHAR(10) COLLATE SQL_Latin1_General_CP1_CI_AS, Contacto CHAR(50) COLLATE SQL_Latin1_General_CP1_CI_AS, Id_Barrio INT)

	INSERT INTO #TempEmpresa (Id_Empresa, Nombre, Direccion, Telefono_Fijo, Telefono_Movil, Mail, Logo, Descripcion, Id_SedePrincipal, Id_Categoria_Servicio, Estado, Contacto, Id_Barrio)
	SELECT 
		Id_Empresa, Nombre, Direccion, Telefono_Fijo, Telefono_Movil, Mail, Logo,
		Descripcion, Id_SedePrincipal, Id_Categoria_Servicio, Estado, Contacto, Id_Barrio
	FROM 
		OPENJSON(@JsonEmpresa)
	WITH (
		Id_Empresa UNIQUEIDENTIFIER '$.Id_Empresa', Nombre CHAR(100) '$.Nombre',
		Direccion CHAR(60) '$.Direccion', Telefono_Fijo CHAR(10) '$.Telefono_Fijo',
		Telefono_Movil CHAR(12) '$.Telefono_Movil', Mail CHAR(50) '$.Mail',
		Logo NVARCHAR(MAX) '$.Logo', Descripcion CHAR(100) '$.Descripcion', Id_SedePrincipal UNIQUEIDENTIFIER '$.Id_SedePrincipal',
		Id_Categoria_Servicio UNIQUEIDENTIFIER '$.Id_Categoria_Servicio', Estado CHAR(10) '$.Estado',
		Contacto CHAR(50) '$.Contacto', Id_Barrio INT '$.Id_Barrio'
	)	

	BEGIN TRY
		
		MERGE EMPRESA AS TARGET
		USING #TempEmpresa AS SOURCE
		ON TARGET.ID_EMPRESA = SOURCE.Id_Empresa 
		WHEN MATCHED THEN
			UPDATE SET TARGET.NOMBRE = SOURCE.Nombre, TARGET.DIRECCION = SOURCE.Direccion, TARGET.TELEFONO_FIJO = SOURCE.Telefono_Fijo,
			TARGET.TELEFONO_MOVIL = SOURCE.Telefono_Movil, TARGET.MAIL = SOURCE.Mail, TARGET.LOGO = SOURCE.Logo,
			TARGET.DESCRIPCION = SOURCE.Descripcion, TARGET.ID_SEDEPRINCIPAL = SOURCE.Id_SedePrincipal, TARGET.ID_CATEGORIA_SERVICIO = SOURCE.Id_Categoria_Servicio,
			TARGET.ESTADO = SOURCE.Estado, TARGET.CONTACTO = SOURCE.Contacto, TARGET.ID_BARRIO = SOURCE.Id_Barrio
		WHEN NOT MATCHED THEN
			INSERT (ID_EMPRESA, NOMBRE, DESCRIPCION, DIRECCION, TELEFONO_FIJO, TELEFONO_MOVIL, MAIL, LOGO, ID_SEDEPRINCIPAL, ID_CATEGORIA_SERVICIO, ESTADO, CONTACTO, ID_BARRIO)
			VALUES (NEWID(), SOURCE.Nombre, SOURCE.Descripcion, SOURCE.Direccion, SOURCE.Telefono_Fijo, SOURCE.Telefono_Movil, 
			SOURCE.Mail, SOURCE.Logo, SOURCE.Id_SedePrincipal, SOURCE.Id_Categoria_Servicio, SOURCE.Estado, SOURCE.Contacto, SOURCE.Id_Barrio);

		IF OBJECT_ID('tempdb..#TempEmpresa') IS NOT NULL DROP TABLE #TempEmpresa

	END TRY
	BEGIN CATCH

		IF OBJECT_ID('tempdb..#TempEmpresa') IS NOT NULL DROP TABLE #TempEmpresa

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR (@ErrorMessage, 16, 1)

	END CATCH

END

GO