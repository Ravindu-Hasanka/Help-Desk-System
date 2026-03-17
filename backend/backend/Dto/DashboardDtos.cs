namespace backend.Dto
{
    public class DashboardSummaryDto
    {
        public int TotalTickets { get; set; }
        public int OpenTickets { get; set; }
        public int InProgressTickets { get; set; }
        public int ResolvedTickets { get; set; }
        public int ClosedTickets { get; set; }
    }

    public class ChartItemDto
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class AgentPerformanceDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TicketCount { get; set; }
    }
}
