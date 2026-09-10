using System.ComponentModel.DataAnnotations;

namespace Replate.Api.Contracts;

public sealed record RegisterRequest(
    [property: Required, MinLength(2), MaxLength(100)] string Name,
    [property: Required, EmailAddress, MaxLength(255)] string Email,
    [property: Required, MinLength(8), MaxLength(128)] string Password,
    [property: Required] string Role);

public sealed record LoginRequest(
    [property: Required, EmailAddress, MaxLength(255)] string Email,
    [property: Required, MinLength(8), MaxLength(128)] string Password);

public sealed record AuthResponse(
    int UserId,
    string Name,
    string Email,
    string Role,
    string Token,
    DateTimeOffset ExpiresAt);
