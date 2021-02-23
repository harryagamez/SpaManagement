﻿CREATE TABLE [dbo].[DETALLE_PROMOCIONES](
	[ID_DETALLE_PROMOCION] [uniqueidentifier] NOT NULL,
	[ID_PROMOCION] [uniqueidentifier] NOT NULL,
	[ID_EMPRESA_SERVICIO] [uniqueidentifier] NOT NULL,
	CONSTRAINT [FK_PROMOCION_DETALLE] FOREIGN KEY ([ID_PROMOCION]) REFERENCES [dbo].[PROMOCIONES] ([ID_PROMOCION]),
	CONSTRAINT [FK_DETALLE_PROMOCIONES_SERVICIOS] FOREIGN KEY ([ID_EMPRESA_SERVICIO]) REFERENCES [dbo].[EMPRESA_SERVICIOS] ([ID_EMPRESA_SERVICIO]),
	CONSTRAINT [PK_DETALLE_PROMOCIONES] PRIMARY KEY CLUSTERED 
	(
		[ID_DETALLE_PROMOCION] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
