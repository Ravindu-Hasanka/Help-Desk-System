namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class TicketCommentDto
{
    public int CommentId { get; init; }
    public int TicketId { get; init; }
    public int UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string CommentText { get; init; } = string.Empty;
    public bool IsInternalNote { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
