CREATE TABLE [dbo].[EMPRESA_SERVICIOS] (
    [ID_EMPRESA_SERVICIO]   UNIQUEIDENTIFIER NOT NULL,
	[ID_EMPRESA]            UNIQUEIDENTIFIER NOT NULL,
	[ID_SERVICIO]           INT              NOT NULL,    
    [TIEMPO]                INT              NOT NULL,
    [VALOR]                 DECIMAL(18,2)    NULL,  
    [APLICACION_NOMINA]     DECIMAL(18,2)    NULL,
    [LOGO_BASE64]           NVARCHAR(MAX)    NULL,
    [ESTADO]                CHAR (10)        NOT NULL,    
    [FECHA_REGISTRO]        DATETIME         NULL,
    [USUARIO_REGISTRO]      CHAR(25)         NULL,
    [FECHA_MODIFICACION]    DATETIME         NULL,
    [USUARIO_MODIFICACION]  CHAR(25)         NULL
    CONSTRAINT [PK_EMPRESA_SERVICIOS] PRIMARY KEY CLUSTERED ([ID_EMPRESA_SERVICIO] ASC),
    CONSTRAINT [FK_EMPRESA_EMPRESA_SERVICIO] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA]),
    CONSTRAINT [FK_SERVICIOS_EMPRESA_SERVICIO] FOREIGN KEY ([ID_SERVICIO]) REFERENCES [dbo].[SERVICIOS] ([ID_SERVICIO])
);

GO