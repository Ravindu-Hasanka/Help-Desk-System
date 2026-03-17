using System;
using System.Collections.Generic;
using System.Text;

namespace HelpDeskSystem.Domain.Entities
{
    internal class User
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
        public ICollection<Ticket> CreatedTickets { get; set; } = new List<Ticket>();
        public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
        public ICollection<TicketComment> TicketComments { get; set; } = new List<TicketComment>();

    }
}
