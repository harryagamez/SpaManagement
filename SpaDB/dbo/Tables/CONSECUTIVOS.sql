﻿CREATE TABLE [dbo].[CONSECUTIVOS] (
    [ID_REGISTRO] INT       IDENTITY (1, 1) NOT NULL,
    [ABREVIATURA] CHAR (5)  NULL,
    [DESCRIPCION] CHAR (30) NULL,
    [VALOR]       INT       NULL,
    CONSTRAINT [PK_CONSECUTIVOS] PRIMARY KEY CLUSTERED ([ID_REGISTRO] ASC)
);

