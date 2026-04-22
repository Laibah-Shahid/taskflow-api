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
import { ToastsComponent } from '../../shared/toasts/toasts';
import { ToastService } from '../../shared/toasts/toast.service';

type StatusFilter = 'All' | TaskItemStatus;

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskListItemComponent, TaskFormComponent, ToastsComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {
  authService = inject(AuthService);
  private tasksService = inject(TasksService);
  private toast = inject(ToastService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly showForm = signal(false);
  readonly editingTask = signal<Task | null>(null);

  readonly activeFilter = signal<StatusFilter>('All');
  readonly filters: StatusFilter[] = [
    'All',
    TaskItemStatus.Todo,
    TaskItemStatus.InProgress,
    TaskItemStatus.Completed
  ];

  readonly visibleTasks = computed(() => {
    const all = this.tasks();
    const filter = this.activeFilter();
    if (filter === 'All') return all;
    return all.filter(t => t.status === filter);
  });

  readonly taskCount = computed(() => this.tasks().length);
  readonly completedCount = computed(
    () => this.tasks().filter(t => t.status === TaskItemStatus.Completed).length
  );
  readonly visibleCount = computed(() => this.visibleTasks().length);

  constructor() {
    this.loadTasks();
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  countForFilter(filter: StatusFilter): number {
    const all = this.tasks();
    if (filter === 'All') return all.length;
    return all.filter(t => t.status === filter).length;
  }

  loadTasks(): void {
    this.loading.set(true);

    this.tasksService.getAll().subscribe({
      next: tasks => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load tasks. Please try again.');
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
          this.toast.success('Task updated');
        } else {
          this.tasks.update(list => [saved, ...list]);
          this.toast.success('Task created');
        }
        this.saving.set(false);
        this.showForm.set(false);
        this.editingTask.set(null);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(editing ? 'Failed to update task.' : 'Failed to create task.');
      }
    });
  }

  onDelete(task: Task): void {
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update(list => list.filter(t => t.id !== task.id));
        this.toast.success('Task deleted');
      },
      error: () => {
        this.toast.error('Failed to delete task.');
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
          this.toast.error('Failed to update task.');
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}