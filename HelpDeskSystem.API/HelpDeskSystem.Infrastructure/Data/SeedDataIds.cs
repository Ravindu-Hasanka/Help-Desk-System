namespace HelpDeskSystem.Infrastructure.Data;

public static class SeedDataIds
{
    public static readonly DateTime SeedTimestamp = new(2026, 03, 17, 0, 0, 0, DateTimeKind.Utc);

    public const int AdminRoleId = 1;
    public const int SupportRoleId = 2;
    public const int RequesterRoleId = 3;

    public const int HardwareCategoryId = 1;
    public const int SoftwareCategoryId = 2;
    public const int NetworkCategoryId = 3;
    public const int AccessCategoryId = 4;

    public const int LowPriorityId = 1;
    public const int MediumPriorityId = 2;
    public const int HighPriorityId = 3;
    public const int CriticalPriorityId = 4;

    public const int OpenStatusId = 1;
    public const int InProgressStatusId = 2;
    public const int ResolvedStatusId = 3;
    public const int ClosedStatusId = 4;

    public const int AdminUserId = 1;
    public const int SupportUserId = 2;
    public const int RequesterUserId = 3;
}
