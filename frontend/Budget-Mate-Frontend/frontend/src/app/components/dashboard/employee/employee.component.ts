import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { ExpenseService } from '../../../service/expense.service';
import { NavbarEmployeeComponent } from './navbar-employee/navbar-employee.component';
import { ExpenseStatusComponent } from './expense-status/expense-status.component';
import { NewExpenseComponent } from './new-expense/new-expense.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarEmployeeComponent, ExpenseStatusComponent, NewExpenseComponent],
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit {
  currentView: string = 'dashboard';
  activeTab: 'history' | 'utilization' = 'history';
  today: Date = new Date();
  userName: string = '';
  userRole: string = '';
  userDepartment: string = '';

  totalDeptBudget: number = 0;
  pendingApprovalsAmount: number = 0;

  constructor(private auth: AuthService, private expenseService: ExpenseService) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.userName = user.name;
      this.userRole = user.role;
      this.userDepartment = user.department;
      this.loadDashboardStats();
    }
  }

  loadDashboardStats() {
    // Call separate API 1
    this.expenseService.getTotalDeptBudget().subscribe({
      next: (res) => this.totalDeptBudget = res.totalDeptBudget,
      error: (err) => console.error(err)
    });

    // Call separate API 2
    this.expenseService.getPendingApprovals().subscribe({
      next: (res) => this.pendingApprovalsAmount = res.pendingApprovals,
      error: (err) => console.error(err)
    });
  }

  // 🔹 This is called when child emits (budgetChange)
  refreshDashboard() {
    this.loadDashboardStats();
  }

  setView(view: string) { this.currentView = view; }
  setTab(tab: 'history' | 'utilization') { this.activeTab = tab; }
  logout() { this.auth.logout(); }
  
}