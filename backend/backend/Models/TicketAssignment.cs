using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class TicketAssignment
    {
        [Key]
        public int AssignmentId { get; set; }

        [Required]
        public int TicketId { get; set; }

        [Required]
        public int AssignedToUserId { get; set; }

        [Required]
        public int AssignedByUserId { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UnassignedAt { get; set; }

        public bool IsCurrent { get; set; } = true;

        public Ticket? Ticket { get; set; }

        [ForeignKey("AssignedToUserId")]
        public User? AssignedToUser { get; set; }

        [ForeignKey("AssignedByUserId")]
        public User? AssignedByUser { get; set; }
    }
}
