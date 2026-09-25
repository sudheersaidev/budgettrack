import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarAdminComponent } from '../../dashboard/admin/navbar-admin/navbar-admin.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth.service'; 
import { AdminNotificationsComponent } from './admin-notifications/admin-notifications.component';
import { AdminProfileEditComponent } from './admin-profile-edit/admin-profile-edit.component';
import { LiveLoginServerComponent } from './live-login-server/live-login-server.component';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarAdminComponent, 
    RouterLink,
    AdminNotificationsComponent,
    AdminProfileEditComponent,
    LiveLoginServerComponent
  ],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit {
  currentUser: any = null;
  activeTab: string = 'notifications';
  isLoading: boolean = true; // Added loading state

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfileFromApi();
  }

  /**
   * Fetches the latest user data from the Backend API
   */
  // admin-profile.component.ts

loadProfileFromApi(): void {
  
  const localUser = this.authService.getUser();
  
  if (localUser && localUser.userID) {
    const id = localUser.userID;
    this.isLoading = true;

    this.authService.refreshUserSession(id).subscribe({
      next: (response) => {
        // If your API returns an array (as seen in Swagger), grab the correct user
        if (Array.isArray(response)) {
          this.currentUser = response.find(u => u.userID === id);
        } else {
          this.currentUser = response;
        }
        
        this.isLoading = false;
        console.log('Updated User with Status:', this.currentUser);
      },
      error: (err) => {
        this.currentUser = localUser;
        this.isLoading = false;
      }
    });
  }
}

  /**
   * Called by (profileSaved) event from child components
   */
  refreshUserData(): void {
    this.loadProfileFromApi();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}