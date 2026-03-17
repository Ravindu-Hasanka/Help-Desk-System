using HelpDeskSystem.Application.Common.Exceptions;
using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.Common.Models;
using HelpDeskSystem.Application.DTOs.Users;
using HelpDeskSystem.Domain.Entities;
using HelpDeskSystem.Infrastructure.Data;
using HelpDeskSystem.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskSystem.Infrastructure.Services;

public sealed class UserService(HelpDeskDbConn dbContext) : IUserService
{
    public async Task<IReadOnlyList<UserSummaryDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Include(user => user.Role)
            .OrderBy(user => user.Name)
            .Select(user => new UserSummaryDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                RoleId = user.RoleId,
                RoleName = user.Role.Name,
                CreatedAt = user.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<UserDetailDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken) =>
        GetUserDtoAsync(userId, cancellationToken);

    public async Task<UserDetailDto> GetUserByIdAsync(int userId, CurrentUserContext currentUser, CancellationToken cancellationToken)
    {
        if (!currentUser.IsAdmin && currentUser.UserId != userId)
        {
            throw new ForbiddenException("You do not have access to this user.");
        }

        return await GetUserDtoAsync(userId, cancellationToken);
    }

    public async Task<UserDetailDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var emailExists = await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("A user with that email already exists.");
        }

        await EnsureRoleExistsAsync(request.RoleId, cancellationToken);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            IsActive = true,
            RoleId = request.RoleId,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetUserDtoAsync(user.UserId, cancellationToken);
    }

    public async Task<UserDetailDto> UpdateUserAsync(int userId, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        await EnsureRoleExistsAsync(request.RoleId, cancellationToken);

        user.Name = request.Name.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        user.IsActive = request.IsActive;
        user.RoleId = request.RoleId;
        user.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetUserDtoAsync(userId, cancellationToken);
    }

    private async Task<UserDetailDto> GetUserDtoAsync(int userId, CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Include(user => user.Role)
            .Where(user => user.UserId == userId)
            .Select(user => new UserDetailDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                RoleId = user.RoleId,
                RoleName = user.Role.Name,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken) ?? throw new NotFoundException("User not found.");
    }

    private async Task EnsureRoleExistsAsync(int roleId, CancellationToken cancellationToken)
    {
        var exists = await dbContext.Roles.AnyAsync(role => role.RoleId == roleId, cancellationToken);
        if (!exists)
        {
            throw new ValidationAppException("The selected role does not exist.");
        }
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
