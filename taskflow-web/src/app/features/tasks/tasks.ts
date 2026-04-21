import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { TasksService } from '../../core/services/tasks';
import {
  Task,
  CreateTaskRequest,
  TaskItemStatus
} from '../../core/models/task.model';
import { TaskListItemComponent } from './components/task-list-item/task-list-item';
import { TaskFormComponent } from './components/task-form/task-form';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskListItemComponent, TaskFormComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {
  authService = inject(AuthService);
  private tasksService = inject(TasksService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly showForm = signal(false);
  readonly editingTask = signal<Task | null>(null);

  readonly taskCount = computed(() => this.tasks().length);
  readonly completedCount = computed(
    () => this.tasks().filter(t => t.status === TaskItemStatus.Completed).length
  );

  constructor() {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.tasksService.getAll().subscribe({
      next: tasks => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load tasks. Please try again.');
      }
    });
  }

  onNewTaskClick(): void {
    this.editingTask.set(null);
    this.showForm.set(true);
  }

  onEdit(task: Task): void {
    this.editingTask.set(task);
    this.showForm.set(true);
  }

  onCancelForm(): void {
    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onSave(payload: CreateTaskRequest): void {
    const editing = this.editingTask();
    this.saving.set(true);

    const request$ = editing
      ? this.tasksService.update(editing.id, payload)
      : this.tasksService.create(payload);

    request$.subscribe({
      next: saved => {
        if (editing) {
          this.tasks.update(list => list.map(t => (t.id === saved.id ? saved : t)));
        } else {
          this.tasks.update(list => [saved, ...list]);
        }
        this.saving.set(false);
        this.showForm.set(false);
        this.editingTask.set(null);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set(
          editing ? 'Failed to update task.' : 'Failed to create task.'
        );
      }
    });
  }

  onDelete(task: Task): void {
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update(list => list.filter(t => t.id !== task.id));
      },
      error: () => {
        this.errorMessage.set('Failed to delete task.');
      }
    });
  }

  onToggleComplete(task: Task): void {
    const newStatus =
      task.status === TaskItemStatus.Completed
        ? TaskItemStatus.Todo
        : TaskItemStatus.Completed;

    this.tasksService
      .update(task.id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate
      })
      .subscribe({
        next: saved => {
          this.tasks.update(list => list.map(t => (t.id === saved.id ? saved : t)));
        },
        error: () => {
          this.errorMessage.set('Failed to update task.');
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}