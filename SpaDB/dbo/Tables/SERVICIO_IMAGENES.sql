CREATE TABLE [dbo].[SERVICIO_IMAGENES] (
	[ID_SERVICIO_IMAGEN] UNIQUEIDENTIFIER NOT NULL,
	[ID_SERVICIO] INT NULL,
	[IMAGEN_BASE64] NVARCHAR(MAX) NULL,
	[FECHA_REGISTRO] DATETIME NULL,
	[FECHA_MODIFICACION] DATETIME NULL,
	CONSTRAINT [PK_SERVICIO_IMAGENES] PRIMARY KEY CLUSTERED ([ID_SERVICIO_IMAGEN] ASC),
	CONSTRAINT [FK_SERVICIOS] FOREIGN KEY ([ID_SERVICIO]) REFERENCES [dbo].[SERVICIOS] ([ID_SERVICIO])
);