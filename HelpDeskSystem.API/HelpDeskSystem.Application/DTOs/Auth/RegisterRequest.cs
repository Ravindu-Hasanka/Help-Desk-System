using System.ComponentModel.DataAnnotations;

namespace HelpDeskSystem.Application.DTOs.Auth;

public sealed class RegisterRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [Phone]
    [StringLength(30)]
    public string? PhoneNumber { get; init; }
}
