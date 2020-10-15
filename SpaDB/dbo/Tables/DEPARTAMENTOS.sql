CREATE TABLE [dbo].[DEPARTAMENTOS] (
    [ID_DEPARTAMENTO] UNIQUEIDENTIFIER       NOT NULL,
    [NOMBRE]       CHAR (60) NULL,
    CONSTRAINT [PK_DEPARTAMENTOS] PRIMARY KEY CLUSTERED ([ID_DEPARTAMENTO] ASC)
);