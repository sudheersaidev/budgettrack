import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { TopRequestMessageComponent } from './top-request-message/top-request-message.component';
import { NotificationsEmployeesComponent } from './notifications-employees/notifications-employees.component';
import { NavbarEmployeeComponent } from '../../dashboard/employee/navbar-employee/navbar-employee.component';
import { UserEmployeeManagementComponent } from './user-employee-management/user-employee-management.component';

@Component({
  selector: 'app-employee-profile',
  imports: [FormsModule,CommonModule,RouterLink,TopRequestMessageComponent,NotificationsEmployeesComponent,NavbarEmployeeComponent,UserEmployeeManagementComponent],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent implements OnInit {
  userName="";
  userRole="";
  userId="";
  userDepartment="";
  constructor(private authService:AuthService){};
  ngOnInit(): void {
     const user=this.authService.getUser();
     this.userName=user.name;
     this.userRole=user.role;
     this.userId=user.userID;
     this.userDepartment=user.department
  }
  // Set the default tab here
  tabs: string = 'notifications';
  // Inside EmployeeProfileComponent class
handleLogout() {
  console.log('Logging out...');
  this.authService.logout(); // Assuming your AuthService has a logout method
  // You might also use Router to navigate back to login
}
}
