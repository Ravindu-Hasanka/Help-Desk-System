namespace backend.Dto
{
    public class AttachmentResponseDto
    {
        public int AttachmentId { get; set; }
        public int TicketId { get; set; }

        public string OriginalFileName { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; }
    }
}
