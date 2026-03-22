using System.ComponentModel.DataAnnotations;
using backend.Enum;

namespace backend.Dto
{
    public class UpdateUserDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string PhoneNo { get; set; } = string.Empty;

        [Required]
        public Role Role { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
