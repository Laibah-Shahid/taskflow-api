import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [],
  template: `
    <div style="padding: 2rem;">
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <h1>My Tasks</h1>
        <div>
          <span style="margin-right: 1rem;">{{ authService.email() }}</span>
          <button (click)="logout()">Logout</button>
        </div>
      </header>
      <p>Task list coming on Day 5. Auth is working — you're logged in!</p>
    </div>
  `
})
export class TasksComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}