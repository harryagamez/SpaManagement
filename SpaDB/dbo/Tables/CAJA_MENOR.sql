CREATE TABLE [dbo].[CAJA_MENOR] (
    [ID_REGISTRO]           INT              IDENTITY (1, 1) NOT NULL,
    [ANIO]                  INT              NULL,
    [MES]                   INT              NULL,
    [DIA]                   SMALLDATETIME    NULL,
    [QUINCENA]              INT              NULL,
    [SALDO_INICIAL]         DECIMAL(18,2)    NULL,
    [ACUMULADO]             DECIMAL(18,2)    NULL,
    [FECHA_REGISTRO]        DATETIME         NULL,
    [USUARIO_REGISTRO]      CHAR (25)        NULL,
    [FECHA_MODIFICACION]    DATETIME         NULL,
    [USUARIO_MODIFICACION]  CHAR (25)        NULL,
    [ID_EMPRESA]            UNIQUEIDENTIFIER NOT NULL
    CONSTRAINT [PK_CAJA_MENOR_1] PRIMARY KEY CLUSTERED ([ID_REGISTRO] ASC),
    CONSTRAINT [FK_ID_EMPRESA_CAJA] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA])
);

GO

