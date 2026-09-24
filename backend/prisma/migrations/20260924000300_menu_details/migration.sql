ALTER TABLE [dbo].[Menus] ADD [Category] NVARCHAR(80) NOT NULL CONSTRAINT [DF_Menus_Category] DEFAULT N'Lainnya';
ALTER TABLE [dbo].[Menus] ADD [AllergensJson] NVARCHAR(1000) NOT NULL CONSTRAINT [DF_Menus_AllergensJson] DEFAULT N'[]';
ALTER TABLE [dbo].[Menus] ADD [DietTagsJson] NVARCHAR(1000) NOT NULL CONSTRAINT [DF_Menus_DietTagsJson] DEFAULT N'[]';
ALTER TABLE [dbo].[Menus] ADD [AllergenNote] NVARCHAR(500) NULL;

CREATE TABLE [dbo].[MenuPhotos] (
  [MenuPhotoId] INT IDENTITY(1,1) NOT NULL,
  [MenuId] INT NOT NULL,
  [Url] NVARCHAR(255) NOT NULL,
  [SortOrder] INT NOT NULL,
  CONSTRAINT [PK_MenuPhotos] PRIMARY KEY ([MenuPhotoId]),
  CONSTRAINT [FK_MenuPhotos_Menus] FOREIGN KEY ([MenuId]) REFERENCES [dbo].[Menus]([MenuId]) ON DELETE CASCADE,
  CONSTRAINT [IX_MenuPhotos_MenuId_SortOrder] UNIQUE ([MenuId], [SortOrder])
);
