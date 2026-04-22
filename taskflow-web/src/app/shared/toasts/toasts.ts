import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [attr.data-kind]="toast.kind">
          <span class="toast-icon">
            @switch (toast.kind) {
              @case ('success') { ✓ }
              @case ('error')   { ✕ }
              @default          { i }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss"
          >×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 1000;
      max-width: calc(100vw - 2rem);
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 240px;
      max-width: 400px;
      padding: 0.7rem 0.9rem;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3b82f6;
      animation: slide-in 0.2s ease-out;
    }

    .toast[data-kind='success'] { border-left-color: #10b981; }
    .toast[data-kind='error']   { border-left-color: #ef4444; }
    .toast[data-kind='info']    { border-left-color: #3b82f6; }

    .toast-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 999px;
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
      flex-shrink: 0;
    }

    .toast[data-kind='success'] .toast-icon { background: #10b981; }
    .toast[data-kind='error']   .toast-icon { background: #ef4444; }
    .toast[data-kind='info']    .toast-icon { background: #3b82f6; }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      color: #1f2937;
      line-height: 1.3;
    }

    .toast-close {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
    }

    .toast-close:hover { color: #4b5563; }

    @keyframes slide-in {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `]
})
export class ToastsComponent {
  toastService = inject(ToastService);
}