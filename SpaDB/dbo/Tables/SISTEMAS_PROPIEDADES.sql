CREATE TABLE [dbo].[SISTEMAS_PROPIEDADES] (
    [ID_SISTEMA_PROPIEDAD]     UNIQUEIDENTIFIER NOT NULL,
    [DESCRIPCION]              VARCHAR(100)  NOT NULL,
	[CODIGO]				   CHAR(5) NOT NULL	
	CONSTRAINT [PK_SISTEMAS_PROPIEDADES] PRIMARY KEY ([ID_SISTEMA_PROPIEDAD] ASC)
);