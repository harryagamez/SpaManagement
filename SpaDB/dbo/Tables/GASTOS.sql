﻿CREATE TABLE [dbo].[GASTOS] (
    [ID_GASTO]           INT              IDENTITY (1, 1) NOT NULL,
    [TIPO_GASTO]         CHAR (15)        NULL,
    [DESCRIPCION]        CHAR (300)       NULL,
    [VALOR]              REAL             NULL,
    [FECHA]              SMALLDATETIME    NULL,
    [ESTADO]             CHAR (12)        NULL,
    [ID_EMPLEADO]        INT              NULL,
    [FECHA_REGISTRO]     DATETIME         NULL,
    [FECHA_MODIFICACION] DATETIME         NULL,
    [ID_EMPRESA]         UNIQUEIDENTIFIER NULL,
    CONSTRAINT [PK_GASTOS] PRIMARY KEY CLUSTERED ([ID_GASTO] ASC),
    CONSTRAINT [FK_ID_EMPRESA_GASTO] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA])
);


GO


