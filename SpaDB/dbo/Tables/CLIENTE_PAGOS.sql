﻿CREATE TABLE [dbo].[CLIENTE_PAGOS](
	[ID_CLIENTEPAGO] [uniqueidentifier] NOT NULL,
	[ID_CLIENTE] [char](15) NULL,
	[FECHA] [datetime] NULL,
	[TOTAL_SERVICIOS] [decimal](18, 2) NULL,
	[TOTAL_PROMOCION] [decimal](18, 2) NULL,
	[TOTAL_SERVICIOS_NOPROMOCION] [decimal](18, 2) NULL,
	[TOTAL_PRODUCTOS] [decimal](18, 2) NULL,
	[DESCUENTO] [decimal](18, 2) NULL,
	[TOTAL_PAGADO] [decimal](18, 2) NULL,
	[ID_EMPRESA] [uniqueidentifier] NOT NULL,
	[USUARIO_CREACION] [char](25) NULL,
	[USUARIO_MODIFICACION] [char](25) NULL
 CONSTRAINT [PK_CLIENTE_PAGO] PRIMARY KEY CLUSTERED 
(
	[ID_CLIENTEPAGO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
