import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeUntilDue',
  standalone: true
})
export class TimeUntilDuePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const due = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(due.getTime())) return '';

    // Compare at day granularity, not milliseconds
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / msPerDay);

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Overdue by 1 day';
    if (diffDays > 1 && diffDays <= 7) return `Due in ${diffDays} days`;
    if (diffDays > 7) {
      const weeks = Math.ceil(diffDays / 7);
      return weeks === 1 ? 'Due in 1 week' : `Due in ${weeks} weeks`;
    }
    if (diffDays < -1) return `Overdue by ${Math.abs(diffDays)} days`;

    return '';
  }
}