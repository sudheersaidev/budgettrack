import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-employee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-employee.component.html',
  styleUrl: './navbar-employee.component.css'
})
export class NavbarEmployeeComponent {
  @Input() userName: string = '';
  @Input() userRole: string = '';

  @Output() logoutNotify = new EventEmitter<void>();
  @Output() navigateNotify = new EventEmitter<void>();
  @Output() dashboardNotify = new EventEmitter<void>();
  @Output() newExpenseNotify = new EventEmitter<void>();
  @Output() settingsNotify = new EventEmitter<void>(); // Notification for settings

  // onProfileClick() {
  //   console.log('Profile clicked');
  // }

  // Added logic for settings click
  onSettingsClick() {
    this.settingsNotify.emit();
  }

  onLogout() {
    this.logoutNotify.emit();
  }

  onNavigate() {
    this.navigateNotify.emit();
  }
}