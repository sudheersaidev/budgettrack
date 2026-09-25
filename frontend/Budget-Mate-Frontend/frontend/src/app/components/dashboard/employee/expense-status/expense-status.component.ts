import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../../../service/expense.service';
import { AuthService } from '../../../../service/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // Added for the popup

@Component({
  selector: 'app-expense-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-status.component.html',
  styleUrl: './expense-status.component.css'
})
export class ExpenseStatusComponent implements OnInit {
  allExpenses: any[] = [];
  expenses: any[] = [];
  
  userDepartment = '';
  budgetIdList: string[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  userId='';
  filterBudgetId = '';
  filterStatus = '';
  filterMonth = '';
  filterMaxAmount = 0;
  maxPossibleAmount = 0;

  constructor(
    private expenseService: ExpenseService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userDepartment = user.department;
      this.userId=user.userID;
    }

    this.expenseService.getAllDeptExpenses().subscribe(data => {
      
      const deptData = data.filter((e: any) => e.department === this.userDepartment && String(e.submittedByUserId) === String(this.userId));
      
      this.allExpenses = deptData;
      this.expenses = [...deptData];
      
      this.budgetIdList = [...new Set(deptData.map((e: any) => e.budgetId))].sort();

      if (deptData.length > 0) {
        this.maxPossibleAmount = Math.max(...deptData.map((e: any) => e.amount));
        this.filterMaxAmount = this.maxPossibleAmount;
      }
    });
  }

  /**
   * Displays the reason for rejection using SweetAlert2.
   * Triggered when clicking the 'Rejected' status badge in the table.
   */
  showRejectedReason(exp: any) {
    // Only proceed if the status is actually Rejected
    if (exp.status !== 'Rejected') return;

    // Use the rejectionReason from the object or a default message
    const reason = exp.rejectionReason || 'No specific reason provided by the manager.';

    Swal.fire({
      title: 'Rejection Details',
      html: `
        <div class="text-start p-2">
          <div class="d-flex align-items-center mb-3 text-danger">
            <i class="bi bi-x-circle-fill fs-4 me-2"></i>
            <span class="fw-bold">Status: Rejected</span>
          </div>
          <div class="p-3 bg-light rounded border-start border-danger border-4">
            <small class="text-muted fw-bold text-uppercase d-block mb-1">Manager Feedback:</small>
            <p class="mb-0 text-dark italic">"${reason}"</p>
          </div>
          <div class="mt-3 extra-small text-muted text-center">
            Expense ID: ${exp.expenseId}
          </div>
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Close',
      confirmButtonColor: '#dc3545',
      showCloseButton: true
    });
  }

  applyFilters() {
    this.expenses = this.allExpenses.filter(exp => {
      const matchesBudgetId = !this.filterBudgetId || exp.budgetId === this.filterBudgetId;
      const matchesStatus = !this.filterStatus || exp.status === this.filterStatus;

      let matchesMonth = true;
      if (this.filterMonth) {
        const date = new Date(exp.submittedDate || exp.submittedDate);
        const monthName = this.months[date.getMonth()];
        matchesMonth = monthName === this.filterMonth;
      }

      const matchesAmount = exp.amount <= this.filterMaxAmount;
      return matchesBudgetId && matchesStatus && matchesMonth && matchesAmount;
    });
  }

  resetFilters() {
    this.filterBudgetId = '';
    this.filterStatus = '';
    this.filterMonth = '';
    this.filterMaxAmount = this.maxPossibleAmount;
    this.expenses = [...this.allExpenses];
  }
}