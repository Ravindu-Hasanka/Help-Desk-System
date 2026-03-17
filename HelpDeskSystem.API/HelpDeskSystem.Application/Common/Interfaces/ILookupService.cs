using HelpDeskSystem.Application.DTOs.Lookup;

namespace HelpDeskSystem.Application.Common.Interfaces;

public interface ILookupService
{
    Task<LookupDataDto> GetLookupDataAsync(CancellationToken cancellationToken);
}
