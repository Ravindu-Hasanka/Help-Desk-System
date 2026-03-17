using HelpDeskSystem.API.Extensions;
using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.DTOs.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var currentUser = User.ToCurrentUserContext();
        var response = await userService.GetCurrentUserAsync(currentUser.UserId, cancellationToken);
        return Ok(response);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var response = await userService.GetUsersAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("{userId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(int userId, CancellationToken cancellationToken)
    {
        var response = await userService.GetUserByIdAsync(userId, User.ToCurrentUserContext(), cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var response = await userService.CreateUserAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetUser), new { userId = response.UserId }, response);
    }

    [HttpPut("{userId:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var response = await userService.UpdateUserAsync(userId, request, cancellationToken);
        return Ok(response);
    }
}
