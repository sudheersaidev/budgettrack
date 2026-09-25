import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isBrowser: boolean;
  private apiUrl = 'https://localhost:7264/api/Auth'; // Base URL for Auth
  private userApiUrl = 'https://localhost:7264/api/Users'; // Base URL for User Management

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Register a new user
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Login and store the session. 
   * Ensure your Backend login response includes the 'status' property.
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (this.isBrowser && response.token) {
          localStorage.setItem('token', response.token);
          // Stores the full user object (including status, userID, role, etc.)
          localStorage.setItem('loggedUser', JSON.stringify(response.user));
          this.handleRoleNavigation(response.user.role);
        }
      })
    );
  }

  private handleRoleNavigation(role: string): void {
    if (role === 'Admin') this.router.navigate(['/admin']);
    else if (role === 'Manager') this.router.navigate(['/manager']);
    else this.router.navigate(['/employee']);
  }

  /**
   * Fetch the latest user profile from the API.
   * This is critical for getting the updated 'status' field.
   */
  refreshUserSession(id: string): Observable<any> {
    return this.http.get<any>(`${this.userApiUrl}/profile/${id}`).pipe(
      tap(user => {
        if (this.isBrowser && user) {
          // If the API returns an array, take the first item; otherwise, use the object.
          const userData = Array.isArray(user) ? user[0] : user;
          
          // Updates local storage with the freshest data from the backend
          localStorage.setItem('loggedUser', JSON.stringify(userData));
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Retrieves the current user from localStorage.
   */
  getUser() {
    if (this.isBrowser) {
      const user = localStorage.getItem('loggedUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Clears session and redirects to login.
   */
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('loggedUser');
    }
    this.router.navigate(['/login']);
  }

  /**
   * Updates profile name/password in DB and syncs the local session.
   * Uses spread operator to ensure 'status' and 'role' are not lost.
   */
  // auth.service.ts logic remains solid, just ensure ID is passed
updateProfile(updatedData: any): Observable<any> {
  const id = updatedData.userID || updatedData.userId; // Matches 'userId' passed from component

  const profileDto = {
    name: updatedData.name,
    password: updatedData.password || null 
  };

  return this.http.put(`${this.userApiUrl}/update-profile/${id}`, profileDto).pipe(
    tap(() => {
      if (this.isBrowser) {
        const currentUser = this.getUser();
        const newUser = { ...currentUser, name: updatedData.name }; 
        localStorage.setItem('loggedUser', JSON.stringify(newUser));
      }
    })
  );
}
/**
 * Fetches all users belonging to a specific department.
 */
getUsersByDepartment(department: string): Observable<any[]> {
  // This calls the new endpoint we will add to the UsersController below
  return this.http.get<any[]>(`${this.userApiUrl}/department/${department}`);
}
}