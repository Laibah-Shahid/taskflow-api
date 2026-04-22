import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string, durationMs = 3000): void {
    this.push('success', message, durationMs);
  }

  error(message: string, durationMs = 5000): void {
    this.push('error', message, durationMs);
  }

  info(message: string, durationMs = 3000): void {
    this.push('info', message, durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(kind: ToastKind, message: string, durationMs: number): void {
    const id = this.nextId++;
    this._toasts.update(list => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}