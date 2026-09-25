import { Component } from '@angular/core';
import { BudgetUsageComponent } from './budget-usage/budget-usage.component';
import { ExpenseConfigurationComponent } from './expense-configuration/expense-configuration.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { NavbarAdminComponent } from './navbar-admin/navbar-admin.component';
import { BudgetManagerChangeComponent } from './budget-manager-change/budget-manager-change.component';


@Component({
  selector: 'app-admin',
  standalone:true,
  imports: [CommonModule,BudgetUsageComponent,ExpenseConfigurationComponent,UserManagementComponent,HeaderComponent,NavbarAdminComponent,BudgetManagerChangeComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  activeTab: string = 'utilization'; 

  switchTab(tab: string) {
    this.activeTab = tab;
  }
}
