namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class TicketDetailDto
{
    public int TicketId { get; init; }
    public string TicketNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public int PriorityId { get; init; }
    public string PriorityName { get; init; } = string.Empty;
    public int StatusId { get; init; }
    public string StatusName { get; init; } = string.Empty;
    public int CreatedByUserId { get; init; }
    public string CreatedByUserName { get; init; } = string.Empty;
    public int? AssignedToUserId { get; init; }
    public string? AssignedToUserName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public DateTime? ResolvedAt { get; init; }
    public DateTime? ClosedAt { get; init; }
    public DateTime? DueDate { get; init; }
    public required IReadOnlyList<TicketCommentDto> Comments { get; init; }
}
