import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { NavbarManagerComponent } from '../../dashboard/manager/navbar-manager/navbar-manager.component';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
import { DepartmentOverviewComponent } from './department-overview/department-overview.component';
import { ManagerEditProfileComponent } from './manager-edit-profile/manager-edit-profile.component';
import { ManagerNotificationsComponent } from './manager-notifications/manager-notifications.component';

@Component({
  selector: 'app-manager-profile',
  standalone: true,
  imports: [
    CommonModule,
    NavbarManagerComponent,
    RouterLink,
    DepartmentOverviewComponent,
    ManagerEditProfileComponent,
    ManagerNotificationsComponent
  ],
  templateUrl: './manager-profile.component.html',
  styleUrl: './manager-profile.component.css'
})
export class ManagerProfileComponent implements OnInit {
  // Use a getter to ensure the UI always pulls the freshest data from the session
  get currentUser() {
    return this.authService.getUser();
  }

  userName: string = '';
  userRole: string = '';
  userId: string = '';
  userDepartment: string = '';
  tabs: string = 'dept-overview';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshUserData();
  }

  /**
   * Helper to load/refresh data from the AuthService session
   */
  refreshUserData(): void {
    const user = this.currentUser;
    if (user) {
      this.userName = user.name || 'Manager';
      this.userRole = user.role || 'Manager';
      this.userId = user.userID || user.userId || 'N/A'; // Support both naming conventions
      this.userDepartment = user.department || 'General';
    }
    console.log(this.userId);
  }

  /**
   * This can be called from the child 'Edit Profile' component 
   * if you want to force a refresh of the header after a save.
   */
  onProfileUpdated() {
    this.refreshUserData();
  }

  handleCreateBudgetClick() {
    Swal.fire({
      icon: 'info',
      title: 'Action Restricted',
      text: 'Creating a budget is not assigned here. Please go to the Dashboard.',
      confirmButtonColor: '#0d6efd'
    });
  }

  handleApprovalClick() {
    Swal.fire({
      icon: 'warning',
      title: 'Navigation Alert',
      text: 'Approval workspace is not available in the Profile section.',
      confirmButtonColor: '#0d6efd'
    });
  }
}