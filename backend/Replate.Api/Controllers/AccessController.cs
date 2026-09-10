using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Replate.Api.Authentication;

namespace Replate.Api.Controllers;

[ApiController]
[Route("api/access")]
public sealed class AccessController : ControllerBase
{
    [Authorize(Roles = UserRoles.Customer)]
    [HttpGet("customer")]
    public IActionResult Customer() => Ok(new { role = UserRoles.Customer });

    [Authorize(Roles = UserRoles.RestaurantOwner)]
    [HttpGet("restaurant-owner")]
    public IActionResult RestaurantOwner() => Ok(new { role = UserRoles.RestaurantOwner });
}
