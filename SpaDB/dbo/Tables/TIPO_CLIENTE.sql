﻿CREATE TABLE [dbo].[TIPO_CLIENTE] (
    [ID_TIPO]     INT        IDENTITY (1, 1) NOT NULL,
    [NOMBRE]      CHAR (10)  NULL,
    [DESCRIPCIÓN] CHAR (100) NULL,
    CONSTRAINT [PK_TIPO_CLIENTE] PRIMARY KEY CLUSTERED ([ID_TIPO] ASC)
);

