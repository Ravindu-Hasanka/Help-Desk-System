using backend.Enum;

namespace backend.Dto
{
    public class TicketResponseDto
    {
        public int TicketId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public int CategoryId { get; set; }

        public Status Status { get; set; }
        public Priority Priority { get; set; }

        public int CreatedByUserId { get; set; }
        public int? AssignedToUserId { get; set; }

        public string TicketNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
