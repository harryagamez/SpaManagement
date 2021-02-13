CREATE TABLE [dbo].[REGISTRO_SESIONES] (
    [ID_REGISTRO]           UNIQUEIDENTIFIER NOT NULL,
    [USUARIO_REGISTRO]      CHAR(25)		 NOT NULL,    
    [FECHA_REGISTRO]        DATETIME         NOT NULL,    
    [IP_ADDRESS]			CHAR(15)         NULL,
    [HOSTNAME]              CHAR(60)         NULL,
    [REGION]                CHAR(60)         NULL,
    [PAIS]                  VARCHAR(10)         NULL,
    [LOCALIZACION]          GEOGRAPHY        NULL,
    [ORG]                   CHAR(100)        NULL,
    [CODIGO_POSTAL]         CHAR(32)         NULL,
    [ZONA_HORARIA]          CHAR(100)        NULL,
    [ID_EMPRESA]            UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_SESION] PRIMARY KEY CLUSTERED ([ID_REGISTRO] ASC)
);