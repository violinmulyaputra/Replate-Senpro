using Microsoft.EntityFrameworkCore;
using Replate.Api.Models;

namespace Replate.Api.Data;

public sealed class ReplateDbContext(DbContextOptions<ReplateDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<ProductionRecord> ProductionRecords => Set<ProductionRecord>();
    public DbSet<SurplusListing> SurplusListings => Set<SurplusListing>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Pickup> Pickups => Set<Pickup>();
    public DbSet<ProductionRecommendation> ProductionRecommendations => Set<ProductionRecommendation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();

        modelBuilder.Entity<Restaurant>()
            .HasOne<User>().WithMany().HasForeignKey(restaurant => restaurant.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Menu>()
            .HasOne<Restaurant>().WithMany().HasForeignKey(menu => menu.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Menu>().ToTable("Menus", table =>
            table.HasCheckConstraint("CK_Menus_NormalPrice", "[NormalPrice] >= 0"));

        modelBuilder.Entity<ProductionRecord>()
            .HasOne<Menu>().WithMany().HasForeignKey(record => record.MenuId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ProductionRecord>()
            .HasIndex(record => new { record.MenuId, record.ProductionDate }).IsUnique();
        modelBuilder.Entity<ProductionRecord>().ToTable("ProductionRecords", table =>
            table.HasCheckConstraint(
                "CK_ProductionRecords_Quantities",
                "[ProducedQuantity] >= 0 AND [SoldQuantity] >= 0 AND [SurplusQuantity] >= 0 AND [SoldQuantity] + [SurplusQuantity] <= [ProducedQuantity]"));

        modelBuilder.Entity<SurplusListing>()
            .HasOne<ProductionRecord>().WithMany().HasForeignKey(listing => listing.ProductionRecordId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<SurplusListing>().ToTable("SurplusListings", table =>
        {
            table.HasCheckConstraint("CK_SurplusListings_Price", "[RescuePrice] >= 0");
            table.HasCheckConstraint(
                "CK_SurplusListings_Quantity",
                "[InitialQuantity] >= 0 AND [AvailableQuantity] >= 0 AND [AvailableQuantity] <= [InitialQuantity]");
            table.HasCheckConstraint("CK_SurplusListings_PickupWindow", "[PickupEnd] > [PickupStart]");
        });

        modelBuilder.Entity<Cart>()
            .HasOne<User>().WithMany().HasForeignKey(cart => cart.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<CartItem>()
            .HasOne<Cart>().WithMany().HasForeignKey(item => item.CartId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<CartItem>()
            .HasOne<SurplusListing>().WithMany().HasForeignKey(item => item.SurplusListingId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<CartItem>()
            .HasIndex(item => new { item.CartId, item.SurplusListingId }).IsUnique();
        modelBuilder.Entity<CartItem>().ToTable("CartItems", table =>
            table.HasCheckConstraint("CK_CartItems_Quantity", "[Quantity] > 0"));

        modelBuilder.Entity<Order>()
            .HasOne<User>().WithMany().HasForeignKey(order => order.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Order>()
            .HasOne<Restaurant>().WithMany().HasForeignKey(order => order.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Order>().ToTable("Orders", table =>
            table.HasCheckConstraint("CK_Orders_TotalAmount", "[TotalAmount] >= 0"));

        modelBuilder.Entity<OrderItem>()
            .HasOne<Order>().WithMany().HasForeignKey(item => item.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<OrderItem>()
            .HasOne<SurplusListing>().WithMany().HasForeignKey(item => item.SurplusListingId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<OrderItem>().ToTable("OrderItems", table =>
        {
            table.HasCheckConstraint("CK_OrderItems_Quantity", "[Quantity] > 0");
            table.HasCheckConstraint("CK_OrderItems_Amounts", "[UnitPrice] >= 0 AND [Subtotal] >= 0");
        });

        modelBuilder.Entity<Pickup>()
            .HasOne<Order>().WithOne().HasForeignKey<Pickup>(pickup => pickup.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Pickup>().HasIndex(pickup => pickup.PickupCode).IsUnique();

        modelBuilder.Entity<ProductionRecommendation>()
            .HasOne<Menu>().WithMany().HasForeignKey(recommendation => recommendation.MenuId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ProductionRecommendation>()
            .HasIndex(recommendation => new { recommendation.MenuId, recommendation.TargetDate }).IsUnique();
        modelBuilder.Entity<ProductionRecommendation>().ToTable("ProductionRecommendations", table =>
            table.HasCheckConstraint(
                "CK_ProductionRecommendations_Quantities",
                "[PredictedDemand] >= 0 AND [RecommendedQuantity] >= 0"));
    }
}
