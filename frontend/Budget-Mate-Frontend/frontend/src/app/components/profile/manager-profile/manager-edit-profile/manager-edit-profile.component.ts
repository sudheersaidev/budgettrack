import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-edit-profile.component.html',
  styleUrl: './manager-edit-profile.component.css'
})
export class ManagerEditProfileComponent implements OnInit {
  managerData: any = {};
  
  // Visibility toggles
  isPasswordVisible = false;
  isConfirmVisible = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      // Clone user data and ensure confirmPassword field exists
      this.managerData = { ...user, confirmPassword: user.password };
    }
  }

  togglePasswordVisibility() { this.isPasswordVisible = !this.isPasswordVisible; }
  toggleConfirmVisibility() { this.isConfirmVisible = !this.isConfirmVisible; }

  updateProfile(): void {
  if (this.managerData.password && this.managerData.password !== this.managerData.confirmPassword) {
    Swal.fire('Error', 'Passwords do not match!', 'error');
    return;
  }

  Swal.fire({
    title: 'Update Profile?',
    text: "Save these changes?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, update it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.updateProfile(this.managerData).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Your profile has been updated.', 'success');
        },
        error: (err) => {
          Swal.fire('Error', 'Failed to update profile on server.', 'error');
        }
      });
    }
  });
}
}