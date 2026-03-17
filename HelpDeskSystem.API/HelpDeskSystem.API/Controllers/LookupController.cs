using HelpDeskSystem.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class LookupController(ILookupService lookupService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var response = await lookupService.GetLookupDataAsync(cancellationToken);
        return Ok(response);
    }
}
