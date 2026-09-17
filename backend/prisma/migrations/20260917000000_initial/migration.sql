BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [UserId] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [Role] NVARCHAR(30) NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Users_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([UserId]),
    CONSTRAINT [IX_Users_Email] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[Restaurants] (
    [RestaurantId] INT NOT NULL IDENTITY(1,1),
    [OwnerId] INT NOT NULL,
    [Name] NVARCHAR(150) NOT NULL,
    [Address] NVARCHAR(500) NOT NULL,
    [Phone] NVARCHAR(30) NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Restaurants_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Restaurants_pkey] PRIMARY KEY CLUSTERED ([RestaurantId])
);

-- CreateTable
CREATE TABLE [dbo].[Menus] (
    [MenuId] INT NOT NULL IDENTITY(1,1),
    [RestaurantId] INT NOT NULL,
    [Name] NVARCHAR(150) NOT NULL,
    [Description] NVARCHAR(1000) NOT NULL,
    [NormalPrice] DECIMAL(18,2) NOT NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [Menus_IsActive_df] DEFAULT 1,
    [CreatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Menus_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Menus_pkey] PRIMARY KEY CLUSTERED ([MenuId])
);

-- CreateTable
CREATE TABLE [dbo].[ProductionRecords] (
    [ProductionRecordId] INT NOT NULL IDENTITY(1,1),
    [MenuId] INT NOT NULL,
    [ProductionDate] DATE NOT NULL,
    [ProducedQuantity] INT NOT NULL,
    [SoldQuantity] INT NOT NULL,
    [SurplusQuantity] INT NOT NULL,
    [RecordedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [ProductionRecords_RecordedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ProductionRecords_pkey] PRIMARY KEY CLUSTERED ([ProductionRecordId]),
    CONSTRAINT [IX_ProductionRecords_MenuId_ProductionDate] UNIQUE NONCLUSTERED ([MenuId],[ProductionDate])
);

-- CreateTable
CREATE TABLE [dbo].[SurplusListings] (
    [SurplusListingId] INT NOT NULL IDENTITY(1,1),
    [ProductionRecordId] INT NOT NULL,
    [RescuePrice] DECIMAL(18,2) NOT NULL,
    [InitialQuantity] INT NOT NULL,
    [AvailableQuantity] INT NOT NULL,
    [PickupStart] DATETIMEOFFSET NOT NULL,
    [PickupEnd] DATETIMEOFFSET NOT NULL,
    [Status] NVARCHAR(30) NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [SurplusListings_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SurplusListings_pkey] PRIMARY KEY CLUSTERED ([SurplusListingId])
);

-- CreateTable
CREATE TABLE [dbo].[Carts] (
    [CartId] INT NOT NULL IDENTITY(1,1),
    [CustomerId] INT NOT NULL,
    [Status] NVARCHAR(30) NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Carts_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Carts_UpdatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Carts_pkey] PRIMARY KEY CLUSTERED ([CartId])
);

-- CreateTable
CREATE TABLE [dbo].[CartItems] (
    [CartItemId] INT NOT NULL IDENTITY(1,1),
    [CartId] INT NOT NULL,
    [SurplusListingId] INT NOT NULL,
    [Quantity] INT NOT NULL,
    CONSTRAINT [CartItems_pkey] PRIMARY KEY CLUSTERED ([CartItemId]),
    CONSTRAINT [IX_CartItems_CartId_SurplusListingId] UNIQUE NONCLUSTERED ([CartId],[SurplusListingId])
);

-- CreateTable
CREATE TABLE [dbo].[Orders] (
    [OrderId] INT NOT NULL IDENTITY(1,1),
    [CustomerId] INT NOT NULL,
    [RestaurantId] INT NOT NULL,
    [Status] NVARCHAR(30) NOT NULL,
    [TotalAmount] DECIMAL(18,2) NOT NULL,
    [OrderedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Orders_OrderedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Orders_pkey] PRIMARY KEY CLUSTERED ([OrderId])
);

-- CreateTable
CREATE TABLE [dbo].[OrderItems] (
    [OrderItemId] INT NOT NULL IDENTITY(1,1),
    [OrderId] INT NOT NULL,
    [SurplusListingId] INT NOT NULL,
    [Quantity] INT NOT NULL,
    [UnitPrice] DECIMAL(18,2) NOT NULL,
    [Subtotal] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [OrderItems_pkey] PRIMARY KEY CLUSTERED ([OrderItemId])
);

-- CreateTable
CREATE TABLE [dbo].[Pickups] (
    [PickupId] INT NOT NULL IDENTITY(1,1),
    [OrderId] INT NOT NULL,
    [PickupCode] NVARCHAR(20) NOT NULL,
    [EstimatedPickupAt] DATETIMEOFFSET NOT NULL,
    [VerifiedAt] DATETIMEOFFSET,
    [Status] NVARCHAR(30) NOT NULL,
    CONSTRAINT [Pickups_pkey] PRIMARY KEY CLUSTERED ([PickupId]),
    CONSTRAINT [IX_Pickups_OrderId] UNIQUE NONCLUSTERED ([OrderId]),
    CONSTRAINT [IX_Pickups_PickupCode] UNIQUE NONCLUSTERED ([PickupCode])
);

-- CreateTable
CREATE TABLE [dbo].[ProductionRecommendations] (
    [ProductionRecommendationId] INT NOT NULL IDENTITY(1,1),
    [MenuId] INT NOT NULL,
    [TargetDate] DATE NOT NULL,
    [PredictedDemand] DECIMAL(18,2) NOT NULL,
    [RecommendedQuantity] INT NOT NULL,
    [Insight] NVARCHAR(1000) NOT NULL,
    [ModelVersion] NVARCHAR(50) NOT NULL,
    [GeneratedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [ProductionRecommendations_GeneratedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ProductionRecommendations_pkey] PRIMARY KEY CLUSTERED ([ProductionRecommendationId]),
    CONSTRAINT [IX_ProductionRecommendations_MenuId_TargetDate] UNIQUE NONCLUSTERED ([MenuId],[TargetDate])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Restaurants_OwnerId] ON [dbo].[Restaurants]([OwnerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Menus_RestaurantId] ON [dbo].[Menus]([RestaurantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SurplusListings_ProductionRecordId] ON [dbo].[SurplusListings]([ProductionRecordId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Carts_CustomerId] ON [dbo].[Carts]([CustomerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CartItems_SurplusListingId] ON [dbo].[CartItems]([SurplusListingId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Orders_CustomerId] ON [dbo].[Orders]([CustomerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Orders_RestaurantId] ON [dbo].[Orders]([RestaurantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_OrderItems_OrderId] ON [dbo].[OrderItems]([OrderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_OrderItems_SurplusListingId] ON [dbo].[OrderItems]([SurplusListingId]);

-- AddForeignKey
ALTER TABLE [dbo].[Restaurants] ADD CONSTRAINT [Restaurants_OwnerId_fkey] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Menus] ADD CONSTRAINT [Menus_RestaurantId_fkey] FOREIGN KEY ([RestaurantId]) REFERENCES [dbo].[Restaurants]([RestaurantId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProductionRecords] ADD CONSTRAINT [ProductionRecords_MenuId_fkey] FOREIGN KEY ([MenuId]) REFERENCES [dbo].[Menus]([MenuId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SurplusListings] ADD CONSTRAINT [SurplusListings_ProductionRecordId_fkey] FOREIGN KEY ([ProductionRecordId]) REFERENCES [dbo].[ProductionRecords]([ProductionRecordId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Carts] ADD CONSTRAINT [Carts_CustomerId_fkey] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CartItems] ADD CONSTRAINT [CartItems_CartId_fkey] FOREIGN KEY ([CartId]) REFERENCES [dbo].[Carts]([CartId]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CartItems] ADD CONSTRAINT [CartItems_SurplusListingId_fkey] FOREIGN KEY ([SurplusListingId]) REFERENCES [dbo].[SurplusListings]([SurplusListingId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Orders] ADD CONSTRAINT [Orders_CustomerId_fkey] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Orders] ADD CONSTRAINT [Orders_RestaurantId_fkey] FOREIGN KEY ([RestaurantId]) REFERENCES [dbo].[Restaurants]([RestaurantId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OrderItems] ADD CONSTRAINT [OrderItems_OrderId_fkey] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([OrderId]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OrderItems] ADD CONSTRAINT [OrderItems_SurplusListingId_fkey] FOREIGN KEY ([SurplusListingId]) REFERENCES [dbo].[SurplusListings]([SurplusListingId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Pickups] ADD CONSTRAINT [Pickups_OrderId_fkey] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([OrderId]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProductionRecommendations] ADD CONSTRAINT [ProductionRecommendations_MenuId_fkey] FOREIGN KEY ([MenuId]) REFERENCES [dbo].[Menus]([MenuId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Preserve domain constraints from the original Entity Framework migration.
ALTER TABLE [dbo].[Menus] ADD CONSTRAINT [CK_Menus_NormalPrice] CHECK ([NormalPrice] >= 0);
ALTER TABLE [dbo].[ProductionRecords] ADD CONSTRAINT [CK_ProductionRecords_Quantities] CHECK ([ProducedQuantity] >= 0 AND [SoldQuantity] >= 0 AND [SurplusQuantity] >= 0 AND [SoldQuantity] + [SurplusQuantity] <= [ProducedQuantity]);
ALTER TABLE [dbo].[SurplusListings] ADD CONSTRAINT [CK_SurplusListings_PickupWindow] CHECK ([PickupEnd] > [PickupStart]);
ALTER TABLE [dbo].[SurplusListings] ADD CONSTRAINT [CK_SurplusListings_Price] CHECK ([RescuePrice] >= 0);
ALTER TABLE [dbo].[SurplusListings] ADD CONSTRAINT [CK_SurplusListings_Quantity] CHECK ([InitialQuantity] >= 0 AND [AvailableQuantity] >= 0 AND [AvailableQuantity] <= [InitialQuantity]);
ALTER TABLE [dbo].[CartItems] ADD CONSTRAINT [CK_CartItems_Quantity] CHECK ([Quantity] > 0);
ALTER TABLE [dbo].[Orders] ADD CONSTRAINT [CK_Orders_TotalAmount] CHECK ([TotalAmount] >= 0);
ALTER TABLE [dbo].[OrderItems] ADD CONSTRAINT [CK_OrderItems_Amounts] CHECK ([UnitPrice] >= 0 AND [Subtotal] >= 0);
ALTER TABLE [dbo].[OrderItems] ADD CONSTRAINT [CK_OrderItems_Quantity] CHECK ([Quantity] > 0);
ALTER TABLE [dbo].[ProductionRecommendations] ADD CONSTRAINT [CK_ProductionRecommendations_Quantities] CHECK ([PredictedDemand] >= 0 AND [RecommendedQuantity] >= 0);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
