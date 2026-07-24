import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'reqlab_token';
  private currentUserSignal = signal<User | null>(this.loadUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('reqlab_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  demoLogin(): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/demo').pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('reqlab_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem('reqlab_user', JSON.stringify(res.user));
    this.currentUserSignal.set(res.user);
  }
}
