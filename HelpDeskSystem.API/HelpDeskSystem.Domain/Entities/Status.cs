namespace HelpDeskSystem.Domain.Entities;

public class Status
{
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsClosedStatus { get; set; }
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
