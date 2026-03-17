using HelpDeskSystem.Domain.Entities;
using HelpDeskSystem.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskSystem.Infrastructure.Data;

public class HelpDeskDbConn(DbContextOptions<HelpDeskDbConn> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Priority> Priorities => Set<Priority>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketComment> TicketComments => Set<TicketComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureRoles(modelBuilder);
        ConfigureUsers(modelBuilder);
        ConfigureCategories(modelBuilder);
        ConfigurePriorities(modelBuilder);
        ConfigureStatuses(modelBuilder);
        ConfigureTickets(modelBuilder);
        ConfigureTicketComments(modelBuilder);
        SeedData(modelBuilder);
    }

    private static void ConfigureRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(role => role.RoleId);
            entity.Property(role => role.Name).HasMaxLength(50);
            entity.Property(role => role.Description).HasMaxLength(250);
            entity.HasIndex(role => role.Name).IsUnique();
        });
    }

    private static void ConfigureUsers(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.UserId);
            entity.Property(user => user.Name).HasMaxLength(100);
            entity.Property(user => user.Email).HasMaxLength(150);
            entity.Property(user => user.PasswordHash).HasMaxLength(512);
            entity.Property(user => user.PhoneNumber).HasMaxLength(30);
            entity.HasIndex(user => user.Email).IsUnique();

            entity.HasOne(user => user.Role)
                .WithMany(role => role.Users)
                .HasForeignKey(user => user.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureCategories(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.CategoryId);
            entity.Property(category => category.CategoryName).HasMaxLength(100);
            entity.Property(category => category.Description).HasMaxLength(250);
            entity.HasIndex(category => category.CategoryName).IsUnique();
        });
    }

    private static void ConfigurePriorities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Priority>(entity =>
        {
            entity.HasKey(priority => priority.PriorityId);
            entity.Property(priority => priority.PriorityName).HasMaxLength(50);
            entity.HasIndex(priority => priority.PriorityName).IsUnique();
        });
    }

    private static void ConfigureStatuses(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Status>(entity =>
        {
            entity.HasKey(status => status.StatusId);
            entity.Property(status => status.StatusName).HasMaxLength(50);
            entity.HasIndex(status => status.StatusName).IsUnique();
        });
    }

    private static void ConfigureTickets(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(ticket => ticket.TicketId);
            entity.Property(ticket => ticket.TicketNumber).HasMaxLength(32);
            entity.Property(ticket => ticket.Title).HasMaxLength(150);
            entity.Property(ticket => ticket.Description).HasMaxLength(4000);
            entity.HasIndex(ticket => ticket.TicketNumber).IsUnique();
            entity.HasQueryFilter(ticket => !ticket.IsDeleted);

            entity.HasOne(ticket => ticket.Category)
                .WithMany(category => category.Tickets)
                .HasForeignKey(ticket => ticket.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ticket => ticket.Priority)
                .WithMany(priority => priority.Tickets)
                .HasForeignKey(ticket => ticket.PriorityId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ticket => ticket.Status)
                .WithMany(status => status.Tickets)
                .HasForeignKey(ticket => ticket.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ticket => ticket.CreatedByUser)
                .WithMany(user => user.CreatedTickets)
                .HasForeignKey(ticket => ticket.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ticket => ticket.AssignedToUser)
                .WithMany(user => user.AssignedTickets)
                .HasForeignKey(ticket => ticket.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureTicketComments(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TicketComment>(entity =>
        {
            entity.HasKey(comment => comment.CommentId);
            entity.Property(comment => comment.CommentText).HasMaxLength(4000);

            entity.HasOne(comment => comment.Ticket)
                .WithMany(ticket => ticket.Comments)
                .HasForeignKey(comment => comment.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(comment => comment.User)
                .WithMany(user => user.TicketComments)
                .HasForeignKey(comment => comment.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = SeedDataIds.AdminRoleId, Name = "Admin", Description = "System administrator" },
            new Role { RoleId = SeedDataIds.SupportRoleId, Name = "Support", Description = "Support staff member" },
            new Role { RoleId = SeedDataIds.RequesterRoleId, Name = "Requester", Description = "Ticket requester" });

        modelBuilder.Entity<Category>().HasData(
            new Category { CategoryId = SeedDataIds.HardwareCategoryId, CategoryName = "Hardware", Description = "Device and peripheral issues", IsActive = true, CreatedAt = SeedDataIds.SeedTimestamp },
            new Category { CategoryId = SeedDataIds.SoftwareCategoryId, CategoryName = "Software", Description = "Application support and bugs", IsActive = true, CreatedAt = SeedDataIds.SeedTimestamp },
            new Category { CategoryId = SeedDataIds.NetworkCategoryId, CategoryName = "Network", Description = "Connectivity and infrastructure", IsActive = true, CreatedAt = SeedDataIds.SeedTimestamp },
            new Category { CategoryId = SeedDataIds.AccessCategoryId, CategoryName = "Access", Description = "Account and permission requests", IsActive = true, CreatedAt = SeedDataIds.SeedTimestamp });

        modelBuilder.Entity<Priority>().HasData(
            new Priority { PriorityId = SeedDataIds.LowPriorityId, PriorityName = "Low", DisplayOrder = 1 },
            new Priority { PriorityId = SeedDataIds.MediumPriorityId, PriorityName = "Medium", DisplayOrder = 2 },
            new Priority { PriorityId = SeedDataIds.HighPriorityId, PriorityName = "High", DisplayOrder = 3 },
            new Priority { PriorityId = SeedDataIds.CriticalPriorityId, PriorityName = "Critical", DisplayOrder = 4 });

        modelBuilder.Entity<Status>().HasData(
            new Status { StatusId = SeedDataIds.OpenStatusId, StatusName = "Open", DisplayOrder = 1, IsClosedStatus = false },
            new Status { StatusId = SeedDataIds.InProgressStatusId, StatusName = "In Progress", DisplayOrder = 2, IsClosedStatus = false },
            new Status { StatusId = SeedDataIds.ResolvedStatusId, StatusName = "Resolved", DisplayOrder = 3, IsClosedStatus = true },
            new Status { StatusId = SeedDataIds.ClosedStatusId, StatusName = "Closed", DisplayOrder = 4, IsClosedStatus = true });

        modelBuilder.Entity<User>().HasData(
            new User
            {
                UserId = SeedDataIds.AdminUserId,
                Name = "System Admin",
                Email = "admin@helpdesk.local",
                PasswordHash = PasswordHasher.HashPassword("Admin@123", "seed-admin"),
                PhoneNumber = "+1-555-0001",
                IsActive = true,
                CreatedAt = SeedDataIds.SeedTimestamp,
                RoleId = SeedDataIds.AdminRoleId
            },
            new User
            {
                UserId = SeedDataIds.SupportUserId,
                Name = "Support Agent",
                Email = "support@helpdesk.local",
                PasswordHash = PasswordHasher.HashPassword("Support@123", "seed-support"),
                PhoneNumber = "+1-555-0002",
                IsActive = true,
                CreatedAt = SeedDataIds.SeedTimestamp,
                RoleId = SeedDataIds.SupportRoleId
            },
            new User
            {
                UserId = SeedDataIds.RequesterUserId,
                Name = "Demo Requester",
                Email = "requester@helpdesk.local",
                PasswordHash = PasswordHasher.HashPassword("Requester@123", "seed-requester"),
                PhoneNumber = "+1-555-0003",
                IsActive = true,
                CreatedAt = SeedDataIds.SeedTimestamp,
                RoleId = SeedDataIds.RequesterRoleId
            });

        modelBuilder.Entity<Ticket>().HasData(
            new Ticket
            {
                TicketId = 1,
                TicketNumber = "HD-20260317-0001",
                Title = "Laptop cannot connect to office Wi-Fi",
                Description = "The office laptop drops the wireless connection every few minutes and cannot reach internal tools.",
                CategoryId = SeedDataIds.NetworkCategoryId,
                PriorityId = SeedDataIds.HighPriorityId,
                StatusId = SeedDataIds.InProgressStatusId,
                CreatedByUserId = SeedDataIds.RequesterUserId,
                AssignedToUserId = SeedDataIds.SupportUserId,
                CreatedAt = SeedDataIds.SeedTimestamp.AddHours(2),
                DueDate = SeedDataIds.SeedTimestamp.AddDays(1),
                IsDeleted = false
            });

        modelBuilder.Entity<TicketComment>().HasData(
            new TicketComment
            {
                CommentId = 1,
                TicketId = 1,
                UserId = SeedDataIds.RequesterUserId,
                CommentText = "It started this morning after the last Windows update.",
                IsInternalNote = false,
                CreatedAt = SeedDataIds.SeedTimestamp.AddHours(3)
            },
            new TicketComment
            {
                CommentId = 2,
                TicketId = 1,
                UserId = SeedDataIds.SupportUserId,
                CommentText = "Investigating wireless driver rollback.",
                IsInternalNote = true,
                CreatedAt = SeedDataIds.SeedTimestamp.AddHours(4)
            });
    }
}
