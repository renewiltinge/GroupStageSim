namespace Tournament.Domain.Entities;

/// <summary>
/// Represents the lifecycle state of a simulation job across the system.
/// </summary>
public enum SimulationJobStatus
{
    /// <summary>
    /// Simulation requests have been queued but processing has not begun.
    /// </summary>
    Queued = 0,

    /// <summary>
    /// Simulation matches are currently being processed by the worker.
    /// </summary>
    Running = 1,

    /// <summary>
    /// All matches for the simulation have completed.
    /// </summary>
    Completed = 2
}
