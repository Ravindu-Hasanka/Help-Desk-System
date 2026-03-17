using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Application.DTOs.Lookup;
using HelpDeskSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskSystem.Infrastructure.Services;

public sealed class LookupService(HelpDeskDbConn dbContext) : ILookupService
{
    public async Task<LookupDataDto> GetLookupDataAsync(CancellationToken cancellationToken)
    {
        var roles = await dbContext.Roles
            .AsNoTracking()
            .OrderBy(role => role.Name)
            .Select(role => new LookupItemDto
            {
                Id = role.RoleId,
                Name = role.Name,
                Description = role.Description
            })
            .ToListAsync(cancellationToken);

        var categories = await dbContext.Categories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.CategoryName)
            .Select(category => new LookupItemDto
            {
                Id = category.CategoryId,
                Name = category.CategoryName,
                Description = category.Description
            })
            .ToListAsync(cancellationToken);

        var priorities = await dbContext.Priorities
            .AsNoTracking()
            .OrderBy(priority => priority.DisplayOrder)
            .Select(priority => new LookupItemDto
            {
                Id = priority.PriorityId,
                Name = priority.PriorityName,
                DisplayOrder = priority.DisplayOrder
            })
            .ToListAsync(cancellationToken);

        var statuses = await dbContext.Statuses
            .AsNoTracking()
            .OrderBy(status => status.DisplayOrder)
            .Select(status => new LookupItemDto
            {
                Id = status.StatusId,
                Name = status.StatusName,
                DisplayOrder = status.DisplayOrder,
                IsClosedStatus = status.IsClosedStatus
            })
            .ToListAsync(cancellationToken);

        return new LookupDataDto
        {
            Roles = roles,
            Categories = categories,
            Priorities = priorities,
            Statuses = statuses
        };
    }
}
