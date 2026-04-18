using System.ComponentModel.DataAnnotations;
using TaskFlow.Api.Models.Enums;

namespace TaskFlow.Api.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
}