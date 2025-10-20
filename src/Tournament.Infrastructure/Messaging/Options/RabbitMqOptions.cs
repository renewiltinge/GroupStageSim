namespace Tournament.Infrastructure.Messaging.Options;

/// <summary>
/// Represents RabbitMQ configuration required for publishing and consuming events.
/// </summary>
public sealed class RabbitMqOptions
{
    public string Host { get; set; } = "localhost";

    public int Port { get; set; } = 5672;

    public string VirtualHost { get; set; } = "/";

    public string UserName { get; set; } = "guest";

    public string Password { get; set; } = "guest";

    public string ExchangeName { get; set; } = "groupsim.events";

    public string ScheduledQueueName { get; set; } = "groupsim.match-scheduled";

    public string PlayedQueueName { get; set; } = "groupsim.match-played";

    public string ScheduledRoutingKey { get; set; } = "match.scheduled";

    public string PlayedRoutingKey { get; set; } = "match.played";
}
