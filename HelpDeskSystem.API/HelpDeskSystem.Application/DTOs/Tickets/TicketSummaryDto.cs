namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class TicketSummaryDto
{
    public int TicketId { get; init; }
    public string TicketNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string CategoryName { get; init; } = string.Empty;
    public string PriorityName { get; init; } = string.Empty;
    public string StatusName { get; init; } = string.Empty;
    public string CreatedByUserName { get; init; } = string.Empty;
    public string? AssignedToUserName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? DueDate { get; init; }
}
