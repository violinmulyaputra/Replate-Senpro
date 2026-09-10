using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Replate.Api.Models;

public sealed class User
{
    public int UserId { get; set; }
    [MaxLength(100)] public string Name { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    [MaxLength(255)] public string PasswordHash { get; set; } = string.Empty;
    [MaxLength(30)] public string Role { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Restaurant
{
    public int RestaurantId { get; set; }
    public int OwnerId { get; set; }
    [MaxLength(150)] public string Name { get; set; } = string.Empty;
    [MaxLength(500)] public string Address { get; set; } = string.Empty;
    [MaxLength(30)] public string Phone { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Menu
{
    public int MenuId { get; set; }
    public int RestaurantId { get; set; }
    [MaxLength(150)] public string Name { get; set; } = string.Empty;
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    [Precision(18, 2)] public decimal NormalPrice { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class ProductionRecord
{
    public int ProductionRecordId { get; set; }
    public int MenuId { get; set; }
    public DateOnly ProductionDate { get; set; }
    public int ProducedQuantity { get; set; }
    public int SoldQuantity { get; set; }
    public int SurplusQuantity { get; set; }
    public DateTimeOffset RecordedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class SurplusListing
{
    public int SurplusListingId { get; set; }
    public int ProductionRecordId { get; set; }
    [Precision(18, 2)] public decimal RescuePrice { get; set; }
    public int InitialQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public DateTimeOffset PickupStart { get; set; }
    public DateTimeOffset PickupEnd { get; set; }
    [MaxLength(30)] public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Cart
{
    public int CartId { get; set; }
    public int CustomerId { get; set; }
    [MaxLength(30)] public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class CartItem
{
    public int CartItemId { get; set; }
    public int CartId { get; set; }
    public int SurplusListingId { get; set; }
    public int Quantity { get; set; }
}

public sealed class Order
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public int RestaurantId { get; set; }
    [MaxLength(30)] public string Status { get; set; } = string.Empty;
    [Precision(18, 2)] public decimal TotalAmount { get; set; }
    public DateTimeOffset OrderedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int SurplusListingId { get; set; }
    public int Quantity { get; set; }
    [Precision(18, 2)] public decimal UnitPrice { get; set; }
    [Precision(18, 2)] public decimal Subtotal { get; set; }
}

public sealed class Pickup
{
    public int PickupId { get; set; }
    public int OrderId { get; set; }
    [MaxLength(20)] public string PickupCode { get; set; } = string.Empty;
    public DateTimeOffset EstimatedPickupAt { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    [MaxLength(30)] public string Status { get; set; } = string.Empty;
}

public sealed class ProductionRecommendation
{
    public int ProductionRecommendationId { get; set; }
    public int MenuId { get; set; }
    public DateOnly TargetDate { get; set; }
    [Precision(18, 2)] public decimal PredictedDemand { get; set; }
    public int RecommendedQuantity { get; set; }
    [MaxLength(1000)] public string Insight { get; set; } = string.Empty;
    [MaxLength(50)] public string ModelVersion { get; set; } = string.Empty;
    public DateTimeOffset GeneratedAt { get; set; } = DateTimeOffset.UtcNow;
}
