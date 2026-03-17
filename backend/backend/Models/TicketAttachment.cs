using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class TicketAttachment
    {
        [Key]
        public int AttachmentId { get; set; }

        [Required]
        public int TicketId { get; set; }

        [Required]
        public int UploadedByUserId { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string OriginalFileName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string StoredFileName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(500)")]
        public string FilePath { get; set; } = string.Empty;

        [Column(TypeName = "varchar(100)")]
        public string? FileType { get; set; }

        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Ticket? Ticket { get; set; }

        [ForeignKey("UploadedByUserId")]
        public User? UploadedByUser
        {
            get; set;
        }
        }
}
