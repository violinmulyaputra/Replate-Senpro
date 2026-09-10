namespace Replate.Api.Authentication;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "Replate.Api";
    public string Audience { get; set; } = "Replate.Client";
    public int ExpiresMinutes { get; set; } = 60;
}
