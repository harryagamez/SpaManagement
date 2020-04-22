﻿CREATE TABLE [dbo].[CAJA_MENOR] (
    [ID_REGISTRO]        INT              IDENTITY (1, 1) NOT NULL,
    [AÑO]                INT              NULL,
    [MES]                INT              NULL,
    [DIA]                SMALLDATETIME    NULL,
    [QUINCENA]           INT              NULL,
    [SALDO_INICIAL]      REAL             CONSTRAINT [DF_CAJA_MENOR_SALDO_INICIAL] DEFAULT ((0)) NOT NULL,
    [ACUMULADO]          REAL             CONSTRAINT [DF_CAJA_MENOR_ACUMULADO] DEFAULT ((0)) NULL,
    [FECHA_REGISTRO]     DATETIME         NULL,
    [FECHA_MODIFICACION] DATETIME         NULL,
    [ID_EMPRESA]         UNIQUEIDENTIFIER NULL,
    CONSTRAINT [PK_CAJA_MENOR_1] PRIMARY KEY CLUSTERED ([ID_REGISTRO] ASC)
);


GO
--Create insert trigger
CREATE TRIGGER [dbo].[MCM_MasterCreation] ON dbo.CAJA_MENOR FOR INSERT
AS
UPDATE [CAJA_MENOR]
SET FECHA_REGISTRO = CURRENT_TIMESTAMP,FECHA_MODIFICACION = CURRENT_TIMESTAMP
WHERE [CAJA_MENOR].ID_REGISTRO = (SELECT TOP 1 ID_REGISTRO FROM INSERTED)

GO
--Create update trigger
CREATE TRIGGER [dbo].[MCM_MasterModification] ON dbo.CAJA_MENOR FOR UPDATE
AS
UPDATE [CAJA_MENOR]
SET FECHA_MODIFICACION = CURRENT_TIMESTAMP
WHERE [CAJA_MENOR].ID_REGISTRO = (SELECT TOP 1 ID_REGISTRO FROM INSERTED)
