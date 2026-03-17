namespace backend.Dto
{
    public class TicketReportDto
    {
        public string TicketNumber { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
