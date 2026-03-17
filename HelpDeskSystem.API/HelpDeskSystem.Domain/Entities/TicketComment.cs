using System;
using System.Collections.Generic;
using System.Text;

namespace HelpDeskSystem.Domain.Entities
{
    internal class TicketComment
    {
        public int CommentId { get; set; }

        public int TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string CommentText { get; set; } = null!;
        public bool IsInternalNote { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
