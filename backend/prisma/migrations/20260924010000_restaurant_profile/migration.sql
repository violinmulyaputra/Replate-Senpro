ALTER TABLE [dbo].[Restaurants] ADD
  [BusinessEmail] NVARCHAR(255),
  [Description] NVARCHAR(1000),
  [TagsJson] NVARCHAR(1000) NOT NULL CONSTRAINT [Restaurants_TagsJson_df] DEFAULT N'[]',
  [LogoUrl] NVARCHAR(500),
  [CoverUrl] NVARCHAR(500),
  [PickupDirections] NVARCHAR(1000),
  [Latitude] DECIMAL(9, 6),
  [Longitude] DECIMAL(9, 6),
  [OpeningStart] NVARCHAR(5),
  [OpeningEnd] NVARCHAR(5),
  [PickupStart] NVARCHAR(5),
  [PickupEnd] NVARCHAR(5),
  [IsOpen] BIT NOT NULL CONSTRAINT [Restaurants_IsOpen_df] DEFAULT 1,
  [NotifyEmail] BIT NOT NULL CONSTRAINT [Restaurants_NotifyEmail_df] DEFAULT 1,
  [NotifyPush] BIT NOT NULL CONSTRAINT [Restaurants_NotifyPush_df] DEFAULT 0;

ALTER TABLE [dbo].[Restaurants] ADD CONSTRAINT [CK_Restaurants_Latitude] CHECK ([Latitude] IS NULL OR [Latitude] BETWEEN -90 AND 90);
ALTER TABLE [dbo].[Restaurants] ADD CONSTRAINT [CK_Restaurants_Longitude] CHECK ([Longitude] IS NULL OR [Longitude] BETWEEN -180 AND 180);
