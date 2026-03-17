using HelpDeskSystem.Application.Common.Exceptions;
using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.DTOs.Auth;
using HelpDeskSystem.Application.DTOs.Users;
using HelpDeskSystem.Domain.Entities;
using HelpDeskSystem.Infrastructure.Data;
using HelpDeskSystem.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskSystem.Infrastructure.Services;

public sealed class AuthService(
    HelpDeskDbConn dbContext,
    IJwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await dbContext.Users
            .Include(candidate => candidate.Role)
            .FirstOrDefaultAsync(candidate => candidate.Email == normalizedEmail, cancellationToken);

        if (user is null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAppException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new ForbiddenException("This account is currently inactive.");
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var emailExists = await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("A user with that email already exists.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            RoleId = SeedDataIds.RequesterRoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        user.Role = await dbContext.Roles.SingleAsync(role => role.RoleId == user.RoleId, cancellationToken);
        return BuildAuthResponse(user);
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var (token, expiresAtUtc) = jwtTokenGenerator.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            User = new UserDetailDto
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
            }
        };
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
