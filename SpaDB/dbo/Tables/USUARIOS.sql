﻿CREATE TABLE [dbo].[USUARIOS] (
    [ID_USUARIO]         INT              IDENTITY (1, 1) NOT NULL,
    [NOMBRE]             CHAR (25)        NULL,
    [CONTRASEÑA]         CHAR (15)        NULL,
    [PERFIL]             CHAR (15)        NULL,
    [ID_EMPRESA]         UNIQUEIDENTIFIER NOT NULL,
    [CODIGO_INTEGRACION] VARCHAR (36)     NULL,
    [FECHA_REGISTRO]     DATETIME         NULL,
    [FECHA_MODIFICACION] DATETIME         NULL
    CONSTRAINT [PK_USUARIOS] PRIMARY KEY CLUSTERED ([ID_USUARIO] ASC),
    CONSTRAINT [FK_ID_EMPRESA_USUARIO] FOREIGN KEY ([ID_EMPRESA]) REFERENCES [dbo].[EMPRESA] ([ID_EMPRESA])
);

