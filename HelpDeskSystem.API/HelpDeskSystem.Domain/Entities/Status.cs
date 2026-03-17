using System;
using System.Collections.Generic;
using System.Text;

namespace HelpDeskSystem.Domain.Entities
{
    internal class Status
    {
        public int StatusId { get; set; }
        public string StatusName { get; set; } = null!;
        public int DisplayOrder { get; set; }
        public bool IsClosedStatus { get; set; } = false;

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
