import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-navbar-manager',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './navbar-manager.component.html',
  styleUrl: './navbar-manager.component.css'
})
export class NavbarManagerComponent {
  @Input() userName: string = '';
  @Input() userRole: string = '';
  
  // ADD THESE FLAGS (Defaulted to true so they show on the dashboard)
  @Input() showCreateButton: boolean = true;
  @Input() showApprovalsButton: boolean = true;
  
  // Events to communicate with the main Manager component
  @Output() onNewBudget = new EventEmitter<void>();
  @Output() onApprovalClick = new EventEmitter<void>();

  isProfileDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {}


  toggleDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
