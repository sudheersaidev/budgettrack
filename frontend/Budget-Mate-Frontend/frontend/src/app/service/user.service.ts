import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationsService } from './notifications.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private isBrowser: boolean;
  private apiUrl = 'https://localhost:7264/api/Users'; // Replace with your actual API URL

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private notificationService: NotificationsService,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Fetch all users from the backend database
   */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Toggle user status (Active/Inactive) in the backend
   * This calls the PUT endpoint you created in the UsersController
   */
  toggleUserStatus(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/toggle-status/${userId}`, {}).pipe(
      tap((response: any) => {
        // Trigger notification for Admin after successful DB update
        this.notificationService.addNotification(
          `User status changed to ${response.status}`, 
          'user'
        );
      })
    );
  }

  /**
   * Adds a new user via the Auth API (Registration)
   */
  addUser(user: any): Observable<any> {
    const authApi = 'https://localhost:7264/api/Auth/register';
    return this.http.post(authApi, user).pipe(
      tap((newUser: any) => {
        this.notificationService.addNotification(
          `New user registered: ${newUser.name}`, 
          'user'
        );
      })
    );
  }

  // --- Session Management (Still using localStorage for the current session) ---

  setCurrentUser(user: any) {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  getCurrentUser(): any | null {
    if (this.isBrowser) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token'); // Clear JWT token as well
    }
  }
  // Inside your UserService class
getRecentLogins(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/recent-logins`);
}
}