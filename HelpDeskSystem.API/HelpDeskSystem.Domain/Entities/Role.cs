using System;
using System.Collections.Generic;
using System.Text;

namespace HelpDeskSystem.Domain.Entities
{
    internal class Role
    {
        public int RoleId { get; set; }
        public string Name { get; set; }
        public string? description { get; set; }
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
