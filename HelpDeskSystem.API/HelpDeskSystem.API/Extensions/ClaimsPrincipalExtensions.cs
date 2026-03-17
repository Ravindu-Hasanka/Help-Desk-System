using System.Security.Claims;
using HelpDeskSystem.Application.Common.Models;

namespace HelpDeskSystem.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static CurrentUserContext ToCurrentUserContext(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue(ClaimTypes.Sid)
            ?? throw new UnauthorizedAccessException("The current token does not contain a user id.");

        var role = principal.FindFirstValue(ClaimTypes.Role)
            ?? throw new UnauthorizedAccessException("The current token does not contain a role.");

        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("The current token contains an invalid user id.");
        }

        return new CurrentUserContext(userId, role);
    }
}
