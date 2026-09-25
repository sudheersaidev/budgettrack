import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  typewriterText: string = '';
  private fullText: string = 'Smart Budgeting.';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Requirements: 8+ chars, Uppercase, Lowercase, Number, Special Char
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/;

    this.registerForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(passwordPattern)]],
      confirmPassword: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void { 
    this.startTypewriter(); 
    this.handleRoleChanges();
  }

  // Auto-logic for Admin/Department relationship
  private handleRoleChanges() {
    this.registerForm.get('role')?.valueChanges.subscribe((roleValue) => {
      const deptControl = this.registerForm.get('department');
      if (roleValue === 'Admin') {
        // 'All' matches the Department Enum index 0 in your C# code
        deptControl?.setValue('All'); 
        deptControl?.disable();
      } else {
        deptControl?.enable();
        if (deptControl?.value === 'All') {
          deptControl?.setValue(''); // Reset if user switches back from Admin
        }
      }
    });
  }

  startTypewriter() {
    let i = 0;
    const type = () => {
      if (i < this.fullText.length) {
        this.typewriterText += this.fullText.charAt(i);
        i++;
        setTimeout(type, 100);
      }
    };
    type();
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Form Invalid',
        text: 'Please fill all required fields and check password complexity.',
        confirmButtonColor: '#818cf8'
      });
      return;
    }

    // getRawValue() is critical here to capture the disabled "Department" field
    const registrationData = this.registerForm.getRawValue();

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: response.message || 'Registration successful!',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        let errorDetail = 'Check your connection or try again.';
        if (err.status === 400 && err.error?.errors) {
          errorDetail = Object.values(err.error.errors).flat().join(', ');
        } else if (typeof err.error === 'string') {
          errorDetail = err.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errorDetail
        });
      }
    });
  }
}