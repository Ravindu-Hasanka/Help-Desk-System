namespace HelpDeskSystem.Infrastructure.Data;

public enum DatabaseProvider
{
    SqlServer,
    PostgreSql
}

public sealed record DatabaseConnectionDescriptor(DatabaseProvider Provider, string ConnectionString);

public static class DatabaseConnectionResolver
{
    public static DatabaseConnectionDescriptor Resolve(string rawConnectionString)
    {
        if (string.IsNullOrWhiteSpace(rawConnectionString))
        {
            throw new InvalidOperationException("A database connection string is required.");
        }

        if (rawConnectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            rawConnectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return new DatabaseConnectionDescriptor(DatabaseProvider.PostgreSql, ConvertPostgresUri(rawConnectionString));
        }

        if (rawConnectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
            rawConnectionString.Contains("Username=", StringComparison.OrdinalIgnoreCase))
        {
            return new DatabaseConnectionDescriptor(DatabaseProvider.PostgreSql, rawConnectionString);
        }

        return new DatabaseConnectionDescriptor(DatabaseProvider.SqlServer, rawConnectionString);
    }

    private static string ConvertPostgresUri(string rawConnectionString)
    {
        var uri = new Uri(rawConnectionString);
        var userInfo = uri.UserInfo.Split(':', 2, StringSplitOptions.TrimEntries);
        var database = uri.AbsolutePath.Trim('/');
        var queryParams = ParseQuery(uri.Query);

        var builder = new List<string>
        {
            $"Host={uri.Host}",
            $"Port={(uri.IsDefaultPort ? 5432 : uri.Port)}",
            $"Database={database}",
            $"Username={Uri.UnescapeDataString(userInfo.ElementAtOrDefault(0) ?? string.Empty)}",
            $"Password={Uri.UnescapeDataString(userInfo.ElementAtOrDefault(1) ?? string.Empty)}"
        };

        foreach (var pair in queryParams)
        {
            var key = pair.Key.ToLowerInvariant() switch
            {
                "sslmode" => "Ssl Mode",
                "channel_binding" => "Channel Binding",
                _ => pair.Key
            };

            builder.Add($"{key}={pair.Value}");
        }

        return string.Join(';', builder);
    }

    private static Dictionary<string, string> ParseQuery(string query)
    {
        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(query))
        {
            return values;
        }

        foreach (var segment in query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = segment.Split('=', 2);
            var key = Uri.UnescapeDataString(parts[0]);
            var value = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : string.Empty;
            values[key] = value;
        }

        return values;
    }
}
