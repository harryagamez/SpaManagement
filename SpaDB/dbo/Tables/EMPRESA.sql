﻿CREATE TABLE [dbo].[EMPRESA] (
    [ID_EMPRESA]       UNIQUEIDENTIFIER NOT NULL,
    [NOMBRE]           CHAR (100)       NULL,
    [DESCRIPCION]      CHAR (100)       NULL,
    [DIRECCION]        CHAR (60)        NULL,
    [TELEFONO_FIJO]    CHAR (10)        NULL,
    [TELEFONO_MOVIL]   CHAR (12)        NULL,
    [MAIL]             VARCHAR (50)     NULL,
    [LOGO]             NVARCHAR (MAX)   NULL,
    [ID_SEDEPRINCIPAL] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [PK_EMPRESA] PRIMARY KEY CLUSTERED ([ID_EMPRESA] ASC)
);

