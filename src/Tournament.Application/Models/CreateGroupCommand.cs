namespace Tournament.Application.Models;

/// <summary>
/// Represents the payload required to create and schedule a new group.
/// </summary>
/// <param name="Name">Group display name.</param>
/// <param name="Teams">Team roster.</param>
public sealed record CreateGroupCommand(string Name, IReadOnlyCollection<TeamSeed> Teams);

/// <summary>
/// Defines the team inputs required during group creation.
/// </summary>
/// <param name="Id">Unique team identifier.</param>
/// <param name="Name">Team name.</param>
/// <param name="Strength">Relative strength.</param>
public sealed record TeamSeed(Guid Id, string Name, double Strength);
