namespace HelpDeskSystem.Application.Common.Models;

public sealed record CurrentUserContext(int UserId, string RoleName)
{
    public bool IsAdmin => string.Equals(RoleName, "Admin", StringComparison.OrdinalIgnoreCase);
    public bool IsSupport => string.Equals(RoleName, "Support", StringComparison.OrdinalIgnoreCase);
    public bool IsRequester => string.Equals(RoleName, "Requester", StringComparison.OrdinalIgnoreCase);
    public bool CanManageTickets => IsAdmin || IsSupport;
}
