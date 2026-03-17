using HelpDeskSystem.Application.Common.Models;
using HelpDeskSystem.Application.DTOs.Users;

namespace HelpDeskSystem.Application.Common.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserSummaryDto>> GetUsersAsync(CancellationToken cancellationToken);
    Task<UserDetailDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken);
    Task<UserDetailDto> GetUserByIdAsync(int userId, CurrentUserContext currentUser, CancellationToken cancellationToken);
    Task<UserDetailDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken);
    Task<UserDetailDto> UpdateUserAsync(int userId, UpdateUserRequest request, CancellationToken cancellationToken);
}
