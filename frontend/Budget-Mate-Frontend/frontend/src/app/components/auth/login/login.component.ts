import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  
  // Lockout State
  isLockedOut = false;
  lockoutTimeRemaining = 0;
  private timerInterval: any;
  private isBrowser: boolean;

  // Animation State
  typewriterText: string = '';
  private fullText: string = 'Welcome Back.';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService, // Using AuthService for Role-Based logic
    private router: Router,
    // Check the flag before touching localStorage
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check the flag before touching localStorage
    this.isBrowser = isPlatformBrowser(this.platformId);
    //it shows red mark
    // we are using form validators in this loginForm using Form Builders
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  //initializating the data before the components loads
  ngOnInit(): void {

    //Initialize the type animations
    this.startTypewriter();
    //security locks
    if (this.isBrowser) {
      this.checkExistingLockout();
    }
  }

  // destroy the timer and security locks
  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // --- Typewriter Animation ---
  startTypewriter() {
    let i = 0;
    const type = () => {
      if (i < this.fullText.length) {
        this.typewriterText += this.fullText.charAt(i);
        i++;
        setTimeout(type, 70);
      }
    };
    type();
  }

  // --- Security Lockout Logic ---
  checkExistingLockout() {
    if (!this.isBrowser) return;
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    if (lockoutUntil) {
      const remaining = Math.round((Number(lockoutUntil) - Date.now()) / 1000);
      if (remaining > 0) {
        this.startCountdown(remaining);
      } else {
        localStorage.removeItem('lockoutUntil');
      }
    }
  }


  // handle failed attempt security  it will check for 2 authenications
  handleFailedAttempt() {
    if (!this.isBrowser) return;

    let attempts = Number(localStorage.getItem('failedAttempts') || 0);
    attempts++;
    localStorage.setItem('failedAttempts', attempts.toString());

    if (attempts >= 3) {
      const penaltySeconds = 60;
      const lockUntil = Date.now() + (penaltySeconds * 1000);
      localStorage.setItem('lockoutUntil', lockUntil.toString());
      
      Swal.fire({
        icon: 'error',
        title: 'Security Lockout',
        text: `Too many attempts. Locked for ${penaltySeconds} seconds.`,
        confirmButtonColor: '#ef4444'
      });

      this.startCountdown(penaltySeconds);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Failed',
        text: `Invalid email or password. ${3 - attempts} attempts left.`,
        confirmButtonColor: '#f59e0b'
      });
    }
  }

  //once startcountdown count is finished it will remove the items
  startCountdown(seconds: number) {
    this.isLockedOut = true;
    this.lockoutTimeRemaining = seconds;
    this.loginForm.disable();

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.lockoutTimeRemaining--;
      if (this.lockoutTimeRemaining <= 0) {
        this.isLockedOut = false;
        this.loginForm.enable();
        clearInterval(this.timerInterval);
        if (this.isBrowser) {
          localStorage.removeItem('lockoutUntil');
          localStorage.removeItem('failedAttempts');
        }
      }
    }, 1000);
  }

  onSubmit() {
  this.submitted = true;
  // 1. If form is invalid, show an alert and stop
  if (this.loginForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Form Invalid',
      text: 'Please fill in all required fields correctly.',
      confirmButtonColor: '#818cf8'
    });
    return;
  }

  // 2. If locked out, stop
  if (this.isLockedOut) return;

  const { email, password } = this.loginForm.value;
  
  this.auth.login(email, password).subscribe({
    next: (response) => {
      if (this.isBrowser) {
        localStorage.removeItem('failedAttempts');
        localStorage.removeItem('lockoutUntil');
      }

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Redirecting to your dashboard...',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true
      });
    },
    error: (err) => {
      this.handleFailedAttempt();
    }
  });
}
}