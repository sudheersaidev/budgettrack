import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../service/auth.service';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-admin.component.html',
  styleUrl: './navbar-admin.component.css'
})
export class NavbarAdminComponent implements OnInit {
  currentUser: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
  }

  onProfileClick() {
    this.router.navigate(['/adminprofile']);
  }

  onLogout() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd', // Primary Blue
      cancelButtonColor: '#6c757d',  // Secondary Grey
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      
      // --- WHITE THEME SETTINGS ---
      background: '#ffffff', // White background
      color: '#212529',      // Dark grey/black text
      iconColor: '#f8bb86',  // Softer orange for warning icon on white
      // ----------------------------
      
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          
          // --- WHITE THEME SETTINGS ---
          background: '#ffffff',
          color: '#212529'
          // ----------------------------
        });
      }
    });
  }
}