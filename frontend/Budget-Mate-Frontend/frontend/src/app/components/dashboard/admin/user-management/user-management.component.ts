import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; 
import { UserService } from '../../../../service/user.service'; // Adjust path as needed

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  searchTerm: string = '';
  users: any[] = []; 
  showDetailModal = false;
  selectedUser: any = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Fetches users from the SQL database via UserService
   */
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        // Map backend 'userID' (SQL) to frontend 'userId' if names differ
        this.users = data;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        Swal.fire('Error', 'Could not fetch users from server', 'error');
      }
    });
  }

  /**
   * Logic for search filtering (remains client-side for performance)
   */
  get filteredUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.users;

    return this.users.filter(user => {
      // Adjusted property names to match your C# Entity (Name, UserID, Department)
      const nameMatch = user.name?.toLowerCase().includes(term);
      const idMatch = user.userID?.toLowerCase().includes(term);
      const deptMatch = user.department?.toLowerCase().includes(term);
      const roleMatch = user.role?.toString().toLowerCase().includes(term);
      
      const statusMatch = user.status?.toLowerCase().includes(term);

      return nameMatch || idMatch || deptMatch || roleMatch || statusMatch;
    });
  }

  openDetailModal(user: any) {
    this.selectedUser = { ...user };
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedUser = null;
  }

  /**
   * Toggles Active/Inactive status and persists it in the SQL Database
   */
  async toggleUserStatus() {
    if (!this.selectedUser) return;

    const isActivating = this.selectedUser.status === 'Inactive';
    const actionTitle = isActivating ? 'Activate User?' : 'Deactivate User?';
    const actionButtonText = isActivating ? 'Yes, Activate' : 'Yes, Deactivate';

    const result = await Swal.fire({
      title: actionTitle,
      text: `Are you sure you want to change the status of ${this.selectedUser.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isActivating ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: actionButtonText
    });

    if (result.isConfirmed) {
      // Call the PUT endpoint in the backend
      this.userService.toggleUserStatus(this.selectedUser.userID).subscribe({
        next: (response) => {
          // 1. Update the local array so the UI reflects change immediately
          const index = this.users.findIndex(u => u.userID === this.selectedUser.userID);
          if (index !== -1) {
            this.users[index].status = response.status;
            this.selectedUser.status = response.status; 
          }

          // 2. Show success message
          Swal.fire({
            title: 'Success!',
            text: `User is now ${response.status}.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Update failed:', err);
          Swal.fire('Failed', 'Database update failed. Please try again.', 'error');
        }
      });
    }
  }
}