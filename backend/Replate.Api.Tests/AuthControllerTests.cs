using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Replate.Api.Authentication;
using Replate.Api.Contracts;
using Replate.Api.Controllers;
using Replate.Api.Data;
using Replate.Api.Models;

namespace Replate.Api.Tests;

public sealed class AuthControllerTests
{
    [Fact]
    public async Task RegisterThenLogin_ReturnsTokenWithoutExposingPassword()
    {
        await using var dbContext = CreateDbContext();
        var controller = CreateController(dbContext);
        var request = new RegisterRequest(
            "Customer Test",
            "CUSTOMER@example.com",
            "secure-password",
            "customer");

        var registerResult = await controller.Register(request, CancellationToken.None);
        var created = Assert.IsType<ObjectResult>(registerResult.Result);
        var registered = Assert.IsType<AuthResponse>(created.Value);
        var storedUser = await dbContext.Users.SingleAsync();

        Assert.Equal(StatusCodes.Status201Created, created.StatusCode);
        Assert.Equal("customer@example.com", registered.Email);
        Assert.Equal(UserRoles.Customer, registered.Role);
        Assert.NotEqual(request.Password, storedUser.PasswordHash);
        Assert.Equal(registered.UserId.ToString(), new JwtSecurityTokenHandler()
            .ReadJwtToken(registered.Token).Subject);

        var loginResult = await controller.Login(
            new LoginRequest(request.Email, request.Password),
            CancellationToken.None);

        Assert.IsType<AuthResponse>(Assert.IsType<OkObjectResult>(loginResult.Result).Value);
    }

    [Fact]
    public async Task Register_WithUnknownRole_ReturnsBadRequest()
    {
        await using var dbContext = CreateDbContext();
        var controller = CreateController(dbContext);

        var result = await controller.Register(
            new RegisterRequest("Test User", "test@example.com", "secure-password", "Admin"),
            CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(dbContext.Users);
    }

    [Fact]
    public async Task Login_WithUnknownEmailOrWrongPassword_ReturnsSameError()
    {
        await using var dbContext = CreateDbContext();
        var controller = CreateController(dbContext);
        await controller.Register(
            new RegisterRequest("Test User", "test@example.com", "secure-password", "customer"),
            CancellationToken.None);

        var unknownEmail = await controller.Login(
            new LoginRequest("unknown@example.com", "secure-password"),
            CancellationToken.None);
        var wrongPassword = await controller.Login(
            new LoginRequest("test@example.com", "wrong-password"),
            CancellationToken.None);

        var unknownProblem = Assert.IsType<ProblemDetails>(
            Assert.IsType<UnauthorizedObjectResult>(unknownEmail.Result).Value);
        var wrongProblem = Assert.IsType<ProblemDetails>(
            Assert.IsType<UnauthorizedObjectResult>(wrongPassword.Result).Value);
        Assert.Equal(unknownProblem.Title, wrongProblem.Title);
    }

    private static ReplateDbContext CreateDbContext() => new(
        new DbContextOptionsBuilder<ReplateDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static AuthController CreateController(ReplateDbContext dbContext) => new(
        dbContext,
        new PasswordHasher<User>(),
        new JwtSettings
        {
            Key = "test-only-key-that-is-at-least-32-characters-long"
        });
}
