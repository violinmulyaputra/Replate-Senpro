using Microsoft.EntityFrameworkCore;

namespace Replate.Api.Data;

public sealed class ReplateDbContext(DbContextOptions<ReplateDbContext> options)
    : DbContext(options);
