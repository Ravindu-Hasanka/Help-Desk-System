using HelpDeskSystem.Application.Common.Interfaces;
using HelpDeskSystem.Infrastructure.Security;
using HelpDeskSystem.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace HelpDeskSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ILookupService, LookupService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
