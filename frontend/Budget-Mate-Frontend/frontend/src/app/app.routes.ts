import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminComponent } from './components/dashboard/admin/admin.component';
import { EmployeeComponent } from './components/dashboard/employee/employee.component';
import { ManagerComponent } from './components/dashboard/manager/manager.component';
import { ExpenseStatusComponent } from './components/dashboard/employee/expense-status/expense-status.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { ApprovalRequestComponent } from './components/dashboard/manager/approval-request/approval-request.component';
import { LandingComponent } from './components/landing/landing.component';
import { EmployeeProfileComponent } from './components/profile/employee-profile/employee-profile.component';
import { ManagerProfileComponent } from './components/profile/manager-profile/manager-profile.component';
import { AdminProfileComponent } from './components/profile/admin-profile/admin-profile.component';
import { DocumentationComponent } from './documentation/documentation.component';
export const routes: Routes = [

  // ✅ DEFAULT ROUTE (VERY IMPORTANT)
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {path:'landing',component:LandingComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard('Admin')],
  },
  {
    path: 'manager',
    component: ManagerComponent,
    canActivate: [authGuard, roleGuard('Manager')]
  },
  {
    path: 'employee',
    component: EmployeeComponent,
    canActivate: [authGuard, roleGuard('Employee')]
  },
  {
    path: 'expenseList',
    component: ExpenseStatusComponent,
    canActivate: [authGuard, roleGuard('Employee')]
  },
  {
    path:'approvalList',
    component:ApprovalRequestComponent,
    canActivate:[authGuard,roleGuard('Manager')]
  },
  {
    path:'employeeProfile',
    component:EmployeeProfileComponent,
    canActivate:[authGuard]
  },
  {
    path:'managerprofile',
    component:ManagerProfileComponent
  },
  {
    path:'adminprofile',
    component:AdminProfileComponent
  },
  {
    path:'documentation',
    component:DocumentationComponent
  }
];