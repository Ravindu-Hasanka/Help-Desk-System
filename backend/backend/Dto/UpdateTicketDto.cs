using backend.Enum;

namespace backend.Dto
{
    public class UpdateTicketDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public Priority Priority { get; set; }
    }
}
