using System.Security.Cryptography;
using System.Text;

namespace HelpDeskSystem.Infrastructure.Security;

public static class PasswordHasher
{
    private const int Iterations = 100_000;
    private const int SaltSize = 16;
    private const int HashSize = 32;

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        return HashPassword(password, salt);
    }

    public static string HashPassword(string password, string seed)
    {
        var salt = SHA256.HashData(Encoding.UTF8.GetBytes(seed)).Take(SaltSize).ToArray();
        return HashPassword(password, salt);
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        var segments = storedHash.Split('.', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length != 3 || !int.TryParse(segments[0], out var iterations))
        {
            return false;
        }

        var salt = Convert.FromBase64String(segments[1]);
        var expectedHash = Convert.FromBase64String(segments[2]);
        var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedHash.Length);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    private static string HashPassword(string password, byte[] salt)
    {
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
}
