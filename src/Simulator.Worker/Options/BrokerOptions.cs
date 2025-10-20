namespace Simulator.Worker.Options;

/// <summary>
/// Configuration options for message broker connectivity.
/// </summary>
public sealed class BrokerOptions
{
    public string HostName { get; set; } = string.Empty;
    public int Port { get; set; } = 0;
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Exchange { get; set; } = "groupsim.matches";
    public string QueueScheduled { get; set; } = "groupsim.simulator.in";
    public string QueuePlayed { get; set; } = "groupsim.api.in";
}