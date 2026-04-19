using System.ComponentModel.DataAnnotations;
using TaskFlow.Api.Models.Enums;

namespace TaskFlow.Api.Dtos.Tasks;

public class UpdateTaskDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    public TaskItemStatus Status { get; set; }

    [Required]
    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }
}