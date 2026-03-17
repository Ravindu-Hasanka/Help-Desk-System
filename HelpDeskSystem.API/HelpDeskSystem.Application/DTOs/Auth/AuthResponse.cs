using HelpDeskSystem.Application.DTOs.Users;

namespace HelpDeskSystem.Application.DTOs.Auth;

public sealed class AuthResponse
{
    public string Token { get; init; } = string.Empty;
    public DateTime ExpiresAtUtc { get; init; }
    public required UserDetailDto User { get; init; }
}
