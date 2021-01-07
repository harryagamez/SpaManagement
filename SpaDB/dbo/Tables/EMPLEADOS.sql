CREATE TABLE [dbo].[EMPLEADOS] (
    [ID_EMPLEADO]           INT IDENTITY (1, 1) NOT NULL,
    [CEDULA]                CHAR (15)        NOT NULL,
    [ID_TIPOPAGO]           UNIQUEIDENTIFIER NULL,
    [MONTO]                 REAL             NULL,
    [NOMBRES]               CHAR (60)        NULL,
    [APELLIDOS]             CHAR (60)        NULL,
    [TELEFONO_FIJO]         CHAR (10)        NULL,
    [TELEFONO_MOVIL]        CHAR (12)        NULL,
    [DIRECCION]             CHAR (25)        NULL,
    [ID_BARRIO]             INT              NULL,
    [FECHA_NACIMIENTO]      SMALLDATETIME    NULL,
    [ESTADO_CIVIL]          CHAR (15)        NULL,
    [NUMERO_HIJOS]          INT              NULL,
    [ESTADO]                CHAR (10)        NULL,
    [ID_EMPRESA]            UNIQUEIDENTIFIER NOT NULL,
    [LOGO_BASE64]           NVARCHAR(MAX)    NULL,
    [FECHA_REGISTRO]        DATETIME         NULL,
    [USUARIO_REGISTRO]      CHAR(25)         NULL,
    [FECHA_MODIFICACION]    DATETIME         NULL,
    [USUARIO_MODIFICACION]  CHAR(25)         NULL
    CONSTRAINT [PK_EMPLEADOS_1] PRIMARY KEY CLUSTERED ([CEDULA] ASC, [ID_EMPRESA] ASC),
    CONSTRAINT [FK_BARRIO] FOREIGN KEY ([ID_BARRIO]) REFERENCES [dbo].[BARRIOS] ([ID_BARRIO]),
    CONSTRAINT [FK_ID_EMPRESA_EMPLEADO] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA])
);

GO


