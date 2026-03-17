using System.ComponentModel.DataAnnotations;

namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class AddTicketCommentRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 2)]
    public string CommentText { get; init; } = string.Empty;

    public bool IsInternalNote { get; init; }
}
