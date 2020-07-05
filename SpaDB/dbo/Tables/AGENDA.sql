﻿CREATE TABLE [dbo].[AGENDA] (
    [ID_AGENDA]          INT       IDENTITY (1, 1) NOT NULL,
    [FECHA_INICIO]       DATETIME  NULL,
    [FECHA_FIN]          DATETIME  NULL,
    [ID_CLIENTE]         INT       NULL,
    [SERVICIO]           INT       NULL,
    [ID_EMPLEADO]        INT       NULL,
    [ESTADO]             CHAR (12) NULL,
    [ID_EMPRESA]         UNIQUEIDENTIFIER NOT NULL,
    [FECHA_REGISTRO]     DATETIME  NULL,
    [FECHA_MODIFICACION] DATETIME  NULL,
    [OBSERVACIONES]      CHAR(200) NULL,
    CONSTRAINT [PK_AGENDA] PRIMARY KEY CLUSTERED ([ID_AGENDA] ASC),
    CONSTRAINT [FK_SERVICIO] FOREIGN KEY ([SERVICIO]) REFERENCES [dbo].[SERVICIOS] ([ID_SERVICIO]),
    CONSTRAINT [FK_ID_EMPRESA_AGENDA] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA])
);

GO


