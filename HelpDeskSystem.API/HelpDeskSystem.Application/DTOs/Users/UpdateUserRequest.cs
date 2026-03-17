using System.ComponentModel.DataAnnotations;

namespace HelpDeskSystem.Application.DTOs.Users;

public sealed class UpdateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Phone]
    [StringLength(30)]
    public string? PhoneNumber { get; init; }

    public bool IsActive { get; init; } = true;

    [Range(1, int.MaxValue)]
    public int RoleId { get; init; }
}
