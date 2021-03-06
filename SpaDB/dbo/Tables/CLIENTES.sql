﻿CREATE TABLE [dbo].[CLIENTES] (
    [ID_CLIENTE]            INT       IDENTITY (1, 1) NOT NULL,
    [CEDULA]                CHAR (15)        NOT NULL,
    [NOMBRES]               CHAR (60)        NULL,
    [APELLIDOS]             CHAR (60)        NULL,
    [TELEFONO_FIJO]         CHAR (10)        NULL,
    [TELEFONO_MOVIL]        CHAR (12)        NULL,
    [MAIL]                  CHAR (60)        NULL,
    [DIRECCION]             CHAR (25)        NULL,
    [ID_BARRIO]             INT              NULL,
    [FECHA_NACIMIENTO]      SMALLDATETIME    NULL,
    [ID_TIPO]               INT              NULL,
    [ESTADO]                CHAR (10)        NULL,
    [ID_EMPRESA]            UNIQUEIDENTIFIER NOT NULL,
    [FECHA_REGISTRO]        DATETIME         NULL,
    [USUARIO_REGISTRO]      CHAR(25)         NULL,
    [FECHA_MODIFICACION]    DATETIME         NULL,
    [USUARIO_MODIFICACION]  CHAR(25)         NULL
    CONSTRAINT [PK_CLIENTES] PRIMARY KEY CLUSTERED ([CEDULA] ASC, [ID_EMPRESA] ASC),
    CONSTRAINT [FK_ID_EMPRESA] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA]),
    CONSTRAINT [FK_TIPO_CLIENTE] FOREIGN KEY ([ID_TIPO]) REFERENCES [dbo].[TIPO_CLIENTE] ([ID_TIPO])
);

GO
