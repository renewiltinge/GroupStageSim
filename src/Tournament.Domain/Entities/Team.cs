namespace Tournament.Domain.Entities;

/// <summary>
/// Represents a single team participating in a tournament group.
/// </summary>
public sealed class Team
{
    /// <summary>
    /// Initializes a new instance of the <see cref="Team"/> class while enforcing invariants.
    /// </summary>
    /// <param name="id">Unique team identifier.</param>
    /// <param name="name">Display name for the team.</param>
    /// <param name="strength">Relative strength rating used during simulations.</param>
    public Team(Guid id, string name, double strength)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Team identifier cannot be empty.", nameof(id));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Team name cannot be empty.", nameof(name));
        }

        if (strength <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(strength), strength, "Strength must be greater than zero.");
        }

        Id = id;
        Name = name;
        Strength = strength;
    }

    public Guid Id { get; }

    public string Name { get; }

    public double Strength { get; }
}
