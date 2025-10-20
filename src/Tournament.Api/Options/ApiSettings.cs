namespace Tournament.Api.Options;

/// <summary>
/// Configuration settings for the API.
/// </summary>
public sealed class ApiSettings
{
    /// <summary>
    /// Gets or sets the base URL for internal API calls.
    /// </summary>
    public string BaseUrl { get; set; } = string.Empty;
}