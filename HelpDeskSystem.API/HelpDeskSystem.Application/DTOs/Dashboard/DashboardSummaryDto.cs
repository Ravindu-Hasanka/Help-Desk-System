using HelpDeskSystem.Application.DTOs.Tickets;

namespace HelpDeskSystem.Application.DTOs.Dashboard;

public sealed class DashboardSummaryDto
{
    public int TotalTickets { get; init; }
    public int OpenTickets { get; init; }
    public int InProgressTickets { get; init; }
    public int ResolvedTickets { get; init; }
    public int ClosedTickets { get; init; }
    public int UnassignedTickets { get; init; }
    public required IReadOnlyList<DashboardBreakdownDto> StatusBreakdown { get; init; }
    public required IReadOnlyList<DashboardBreakdownDto> PriorityBreakdown { get; init; }
    public required IReadOnlyList<TicketSummaryDto> RecentTickets { get; init; }
}
