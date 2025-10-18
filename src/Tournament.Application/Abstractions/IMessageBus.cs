namespace Tournament.Application.Abstractions;

/// <summary>
/// Abstraction over message brokers required for event-driven orchestration.
/// </summary>
public interface IMessageBus
{
    /// <summary>
    /// Publishes a message to the underlying transport.
    /// </summary>
    /// <typeparam name="TMessage">Type of the message.</typeparam>
    /// <param name="message">Payload to publish.</param>
    /// <param name="cancellationToken">Termination token.</param>
    Task PublishAsync<TMessage>(TMessage message, CancellationToken cancellationToken)
        where TMessage : class;
}
