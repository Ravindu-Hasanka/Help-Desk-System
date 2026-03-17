namespace HelpDeskSystem.Application.DTOs.Tickets;

public sealed class TicketQueryParameters
{
    public string? Search { get; init; }
    public int? CategoryId { get; init; }
    public int? PriorityId { get; init; }
    public int? StatusId { get; init; }
    public int? AssignedToUserId { get; init; }
    public int? CreatedByUserId { get; init; }
    public bool IncludeClosed { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
