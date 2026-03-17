namespace HelpDeskSystem.Domain.Entities;

public class Ticket
{
    public int TicketId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int PriorityId { get; set; }
    public Priority Priority { get; set; } = null!;
    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public int? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsDeleted { get; set; }
    public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
}
