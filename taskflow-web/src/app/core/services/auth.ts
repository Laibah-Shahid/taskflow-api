import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';

const TOKEN_KEY = 'taskflow_token';
const EMAIL_KEY = 'taskflow_email';
const EXPIRES_KEY = 'taskflow_expires_at';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Reactive auth state backed by signals
  private readonly _token = signal<string | null>(this.readStoredToken());
  private readonly _email = signal<string | null>(localStorage.getItem(EMAIL_KEY));

  readonly token = this._token.asReadonly();
  readonly email = this._email.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.storeSession(response))
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this._token.set(null);
    this._email.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(EMAIL_KEY, response.email);
    localStorage.setItem(EXPIRES_KEY, response.expiresAt);
    this._token.set(response.token);
    this._email.set(response.email);
  }

  private readStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiresAt = localStorage.getItem(EXPIRES_KEY);

    if (!token || !expiresAt) return null;

    // Expired token? Clean up and return null.
    if (new Date(expiresAt) <= new Date()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      return null;
    }

    return token;
  }
}