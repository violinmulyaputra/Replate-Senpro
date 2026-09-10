using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using Replate.Api.Authentication;

namespace Replate.Api.Tests;

public sealed class RoleAccessTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string JwtKey = "test-only-key-that-is-at-least-32-characters-long";
    private readonly WebApplicationFactory<Program> factory;

    public RoleAccessTests(WebApplicationFactory<Program> factory)
    {
        this.factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Jwt:Key", JwtKey);
            builder.UseSetting(
                "ConnectionStrings:DefaultConnection",
                "Server=localhost;Database=ReplateTests;TrustServerCertificate=True");
        });
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();

        var response = await client.GetAsync("/api/access/customer");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRoles.Customer, "/api/access/customer", HttpStatusCode.OK)]
    [InlineData(UserRoles.Customer, "/api/access/restaurant-owner", HttpStatusCode.Forbidden)]
    [InlineData(UserRoles.RestaurantOwner, "/api/access/restaurant-owner", HttpStatusCode.OK)]
    [InlineData(UserRoles.RestaurantOwner, "/api/access/customer", HttpStatusCode.Forbidden)]
    public async Task ProtectedEndpoint_EnforcesRole(
        string role,
        string path,
        HttpStatusCode expectedStatus)
    {
        using var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(role));

        var response = await client.GetAsync(path);

        Assert.Equal(expectedStatus, response.StatusCode);
    }

    private HttpClient CreateClient() => factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost")
    });

    private static string CreateToken(string role)
    {
        var token = new JwtSecurityToken(
            "Replate.Api",
            "Replate.Client",
            [new Claim(JwtRegisteredClaimNames.Sub, "1"), new Claim("role", role)],
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtKey)),
                SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
