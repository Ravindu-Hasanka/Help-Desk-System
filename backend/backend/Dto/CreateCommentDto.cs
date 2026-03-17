namespace backend.Dto
{
    public class CreateCommentDto
    {
        public string CommentText { get; set; } = string.Empty;
        public bool IsInternalNote { get; set; }
    }
}
