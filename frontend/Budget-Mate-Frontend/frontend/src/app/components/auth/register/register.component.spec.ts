import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../service/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)
      ]],
      department: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;

    // 1. Validation Check
    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Your Details',
        text: 'Please fill out all fields correctly. Ensure your password is strong.',
        confirmButtonColor: '#4e73df'
      });
      return;
    }

    // 2. Execution Logic
    try {
      // Call service to add user
      this.userService.addUser(this.registerForm.value);

      // 3. Professional Success Alert
      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Registration successful. Redirecting you to login...',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
      }).then(() => {
        this.router.navigate(['/login']);
      });

    } catch (error) {
      // 4. Error handling if service fails
      Swal.fire({
        icon: 'error',
        title: 'Registration Error',
        text: 'Something went wrong while creating your account. Please try again.',
        confirmButtonColor: '#e74a3b'
      });
    }
  }
}