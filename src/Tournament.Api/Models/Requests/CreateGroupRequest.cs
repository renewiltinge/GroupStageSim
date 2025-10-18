using System.ComponentModel.DataAnnotations;

namespace Tournament.Api.Models.Requests;

/// <summary>
/// Request payload for creating a new tournament group.
/// </summary>
public sealed class CreateGroupRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    [MaxLength(4)]
    public IList<TeamRequest> Teams { get; set; } = new List<TeamRequest>();
}

/// <summary>
/// Represents team metadata included in a create group request.
/// </summary>
public sealed class TeamRequest
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(0.1, 5.0)]
    public double Strength { get; set; }
}
