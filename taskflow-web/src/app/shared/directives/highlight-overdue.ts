import {
  Directive,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input
} from '@angular/core';

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);

  dueDate = input<string | null>(null, { alias: 'appHighlightOverdue' });
  isCompleted = input<boolean>(false);

  constructor() {
    effect(() => {
      const due = this.dueDate();
      const completed = this.isCompleted();

      const shouldHighlight = !completed && due !== null && this.isOverdue(due);

      if (shouldHighlight) {
        this.renderer.addClass(this.el.nativeElement, 'is-overdue');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'is-overdue');
      }
    });
  }

  private isOverdue(dueDate: string): boolean {
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    return startOfDue.getTime() < startOfToday.getTime();
  }
}