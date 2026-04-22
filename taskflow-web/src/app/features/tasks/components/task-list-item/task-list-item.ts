import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Task, TaskItemStatus } from '../../../../core/models/task.model';
import { TimeUntilDuePipe } from '../../../../shared/pipes/time-until-due-pipe';
import { HighlightOverdueDirective } from '../../../../shared/directives/highlight-overdue';

@Component({
  selector: 'app-task-list-item',
  standalone: true,
  imports: [DatePipe, TimeUntilDuePipe, HighlightOverdueDirective],
  templateUrl: './task-list-item.html',
  styleUrl: './task-list-item.css'
})
export class TaskListItemComponent {
  task = input.required<Task>();

  edit = output<Task>();
  delete = output<Task>();
  toggleComplete = output<Task>();

  readonly TaskItemStatus = TaskItemStatus;

  onEdit(): void { this.edit.emit(this.task()); }
  onDelete(): void { this.delete.emit(this.task()); }
  onToggleComplete(): void { this.toggleComplete.emit(this.task()); }
}