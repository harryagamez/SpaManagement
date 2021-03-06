﻿CREATE TABLE [dbo].[EMPLEADOS_SERVICIOS] (
    [ID_EMPLEADO_SERVICIO] INT IDENTITY (1, 1) NOT NULL,
    [ID_EMPLEADO]          CHAR (15) NOT NULL,
    [ID_EMPRESA_SERVICIO]  UNIQUEIDENTIFIER NOT NULL,
    [ID_SERVICIO]          INT       NOT NULL,
    [APLICACION_NOMINA]    DECIMAL(18,2),
    [FECHA_CREACION]       DATETIME NULL,
	[USUARIO_CREACION]     CHAR(25) NULL,
    [FECHA_MODIFICACION]   DATETIME NULL,
    [USUARIO_MODIFICACION]  CHAR(25) NULL 
    CONSTRAINT [PK_EMPLEADOS_SERVICIOS] PRIMARY KEY CLUSTERED ([ID_EMPLEADO_SERVICIO] ASC),
    CONSTRAINT [FK_EMPLEADO_SERVICIO_EMPRESA_SERVICIO] FOREIGN KEY ([ID_EMPRESA_SERVICIO]) REFERENCES [dbo].[EMPRESA_SERVICIOS] ([ID_EMPRESA_SERVICIO]),
    CONSTRAINT [FK_ID_SERVICIO] FOREIGN KEY ([ID_SERVICIO]) REFERENCES [dbo].[SERVICIOS] ([ID_SERVICIO])
);

