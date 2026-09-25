import { Component, OnInit, Output, EventEmitter } from '@angular/core'; // Added Output/EventEmitter
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-employee-management.component.html',
  styleUrl: './user-employee-management.component.css'
})
export class UserEmployeeManagementComponent implements OnInit {
  user: any = {};
  showPassword = false;
  showConfirmPassword = false;

  // Added this to notify parent components (like a Sidebar or Navbar) to refresh the name
  @Output() profileSaved = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const data = this.authService.getUser();
    if (data) {
      // Create a fresh copy to avoid mutating the session until the API succeeds
      this.user = { ...data, password: '', confirmPassword: '' };
    }
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onUpdate() {
    // 1. Validation: Passwords must match if a new one is being entered
    if (this.user.password && this.user.password !== this.user.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match!',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    // 2. Confirmation Popup
    Swal.fire({
      title: 'Update Profile?',
      text: "This will save your new details to the database.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // 3. API Call: Subscribing to the Observable
        this.authService.updateProfile(this.user).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: 'Your profile has been saved to the server.',
              timer: 2000,
              showConfirmButton: false
            });

            // Emit event so parent components can refresh their headers
            this.profileSaved.emit();
            
            // Clear password fields for security
            this.user.password = '';
            this.user.confirmPassword = '';
          },
          error: (err) => {
            console.error('Update Error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: 'The server could not process your request. Please try again later.',
            });
          }
        });

      }
    });
  }
}