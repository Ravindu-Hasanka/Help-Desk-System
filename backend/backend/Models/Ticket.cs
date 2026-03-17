using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Enum;

namespace backend.Models
{
    public class Ticket
    {
        [Key]
        public int TicketId { get; set; }

        [Required]
        [Column(TypeName = "varchar(30)")]
        public string TicketNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(200)")]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }
        [Required]
        public Priority Priority { get; set; }

        [Required]
        public Status Status { get; set; }

        [Required]
        public int CreatedByUserId { get; set; }

        public int? AssignedToUserId { get; set; }

        public Category? Category { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User? CreatedByUser { get; set; }

        [ForeignKey("AssignedToUserId")]
        public User? AssignedToUser { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public DateTime? DueDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
