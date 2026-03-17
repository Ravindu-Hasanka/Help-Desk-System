using System;
using System.Collections.Generic;
using System.Text;

namespace HelpDeskSystem.Domain.Entities
{
    internal class Priority
    {
        public int PriorityId { get; set; }
        public string PriorityName { get; set; } = null!;
        public int DisplayOrder { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
