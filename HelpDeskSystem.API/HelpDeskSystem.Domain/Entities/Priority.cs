namespace HelpDeskSystem.Domain.Entities;

public class Priority
{
    public int PriorityId { get; set; }
    public string PriorityName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
