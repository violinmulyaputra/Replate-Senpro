ALTER TABLE [dbo].[Users] ADD [Phone] NVARCHAR(30);

CREATE TABLE [dbo].[PasswordResetTokens] (
    [PasswordResetTokenId] INT NOT NULL IDENTITY(1,1),
    [UserId] INT NOT NULL,
    [TokenHash] CHAR(64) NOT NULL,
    [ExpiresAt] DATETIMEOFFSET NOT NULL,
    [UsedAt] DATETIMEOFFSET,
    [CreatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [PasswordResetTokens_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PasswordResetTokens_pkey] PRIMARY KEY CLUSTERED ([PasswordResetTokenId]),
    CONSTRAINT [IX_PasswordResetTokens_TokenHash] UNIQUE NONCLUSTERED ([TokenHash])
);

CREATE NONCLUSTERED INDEX [IX_PasswordResetTokens_UserId] ON [dbo].[PasswordResetTokens]([UserId]);
ALTER TABLE [dbo].[PasswordResetTokens] ADD CONSTRAINT [PasswordResetTokens_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE CASCADE ON UPDATE NO ACTION;
