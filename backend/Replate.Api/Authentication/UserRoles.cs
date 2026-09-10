namespace Replate.Api.Authentication;

public static class UserRoles
{
    public const string Customer = "Customer";
    public const string RestaurantOwner = "RestaurantOwner";

    public static string? Normalize(string? role) => role?.Trim().ToLowerInvariant() switch
    {
        "customer" => Customer,
        "restaurantowner" or "restaurant_owner" or "restaurant owner" => RestaurantOwner,
        _ => null
    };
}
