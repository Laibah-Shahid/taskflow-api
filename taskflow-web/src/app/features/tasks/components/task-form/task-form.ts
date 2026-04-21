import { Component, input, output, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Task,
  CreateTaskRequest,
  TaskItemStatus,
  TaskPriority
} from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);

  // null = creating, Task = editing
  task = input<Task | null>(null);
  saving = input<boolean>(false);

  save = output<CreateTaskRequest>();
  cancel = output<void>();

  readonly statuses = Object.values(TaskItemStatus);
  readonly priorities = Object.values(TaskPriority);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    status: [TaskItemStatus.Todo],
    priority: [TaskPriority.Medium],
    dueDate: ['']
  });

  constructor() {
    // When `task` input changes, reset the form to match
    effect(() => {
      const t = this.task();
      if (t) {
        this.form.setValue({
          title: t.title,
          description: t.description ?? '',
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.substring(0, 10) : ''   // "YYYY-MM-DD" for input[type=date]
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          status: TaskItemStatus.Todo,
          priority: TaskPriority.Medium,
          dueDate: ''
        });
      }
    });
  }

  get isEditing(): boolean {
    return this.task() !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateTaskRequest = {
      title: raw.title.trim(),
      description: raw.description?.trim() || null,
      status: raw.status,
      priority: raw.priority,
      dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString() : null
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}