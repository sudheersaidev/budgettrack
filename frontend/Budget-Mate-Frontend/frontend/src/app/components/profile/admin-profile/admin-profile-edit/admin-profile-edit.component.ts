import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-profile-edit.component.html',
  styleUrl: './admin-profile-edit.component.css'
})
export class AdminProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: any;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
  this.currentUser = this.authService.getUser();
  
  this.profileForm = this.fb.group({
    name: [this.currentUser?.name || '', Validators.required],
    email: [{ value: this.currentUser?.email || '', disabled: true }],
    // Match the HTML 'userID' exactly
    userID: [{ value: this.currentUser?.userID || this.currentUser?.userId || '', disabled: true }],
    password: ['', [Validators.minLength(4)]],
    confirmPassword: ['']
  });
}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // admin-profile-edit.component.ts

onUpdate() {
  if (this.profileForm.valid) {
    const { name, password, confirmPassword } = this.profileForm.getRawValue();

    if (password && password !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match!', 'error');
      return;
    }

    // Ensure we send the ID to the backend
    const updatedData: any = { 
      userID: this.currentUser?.userID || this.currentUser?.userId, 
      name: name 
    };
    if (password) updatedData.password = password;

    // SUBSCRIBE to the observable
    this.authService.updateProfile(updatedData).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Profile updated successfully!', 'success');
        
        // Clear password fields in the UI
        this.profileForm.patchValue({ password: '', confirmPassword: '' });
        
        // IMPORTANT: Refresh the local currentUser object
        this.currentUser = this.authService.getUser();
      },
      error: (err) => {
        Swal.fire('Error', 'Failed to update profile', 'error');
      }
    });
  }
}
}