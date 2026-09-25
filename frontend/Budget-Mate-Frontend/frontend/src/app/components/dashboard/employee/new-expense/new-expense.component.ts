import { Component, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, take } from 'rxjs';
import Swal from 'sweetalert2';

import { ExpenseService, Expense } from '../../../../service/expense.service';
import { TopRequestService } from '../../../../service/top-request.service';
import { CategoryService, Category } from '../../../../service/category.service';
import { AuthService } from '../../../../service/auth.service';
import { ManagerService } from '../../../../service/manager.service';

@Component({
  selector: 'app-new-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-expense.component.html',
  styleUrl: './new-expense.component.css'
})
export class NewExpenseComponent implements OnInit, OnDestroy {
  // Properties
  budgetIds: string[] = [];
  userDepartment: string = '';
  userId: string = '';
  userName: string = '';
  userRole: string = ''; 
  
  remainingBalance: number = 0; 
  utilizedAmount: number = 0;
  totalAllocated: number = 0;
  utilizationPercent: number = 0;

  selectedBudgetId = '';
  selectedCategory = '';
  description = '';
  amount!: number;
  filteredExpenses: Expense[] = [];
  categories: Category[] = []; 
  assignedBudgets: any[] = [];
  selectedManagerName: string = '';

  topUpAmount!: number;
  topUpReason = '';

  @Output() expenseSubmitted = new EventEmitter<void>();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private expenseService: ExpenseService,
    private topRequestService: TopRequestService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private managerService: ManagerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userDepartment = user.department;
      this.userName = user.name;
      this.userId = user.userId;
      this.userRole = user.role;
    }

    // ngOnInit in NewExpenseComponent.ts
this.subscriptions.add(
  this.expenseService.expenses$.subscribe(expenses => {
    // Data is already filtered by User on backend now
    this.filteredExpenses = expenses; 
    
    // Recalculate utilization based on all user expenses
    this.calculateUtilization(expenses);
    
    console.log('Displaying in Table:', this.filteredExpenses);
  })
);
      
 
    console.log(this.filteredExpenses);
    this.loadCategories();
    this.loadAssignedBudgetIds();
    this.expenseService.refreshExpenses(); 
  }

  loadAssignedBudgetIds() {
    this.expenseService.getEmployeeAssignedBudgets().subscribe({
      next: (data: any[]) => {
        this.assignedBudgets = data;
        this.budgetIds = data.map(b => b.budgetId);
        if (this.budgetIds.length === 1) {
          this.selectedBudgetId = this.budgetIds[0];
          this.onBudgetChangeLocal();
        }
      },
      error: (err) => console.error('Error fetching budgets', err)
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data.filter(cat => cat.enabled);
    });
  }

  onBudgetChangeLocal() {
    const selectedBudget = this.assignedBudgets.find(b => b.budgetId === this.selectedBudgetId);
    this.selectedManagerName = selectedBudget ? selectedBudget.managerName : 'No Manager Assigned';

    this.expenseService.expenses$.pipe(take(1)).subscribe(expenses => {
      this.calculateUtilization(expenses);
    });
  }

  private calculateUtilization(expenses: Expense[]) {
    if (!this.selectedBudgetId) return;
    this.managerService.getBudgetsByDepartment(this.userDepartment).subscribe(budgets => {
      const budget = budgets.find((b: any) => b.budgetId === this.selectedBudgetId);
      if (budget) {
        this.totalAllocated = budget.amountAllocated;
        this.utilizedAmount = expenses
          .filter(e => e.budgetId === this.selectedBudgetId && e.status !== 'Rejected')
          .reduce((sum, e) => sum + e.amount, 0);
        this.remainingBalance = Math.max(this.totalAllocated - this.utilizedAmount, 0);
        this.utilizationPercent = this.totalAllocated > 0 ? (this.utilizedAmount / this.totalAllocated) * 100 : 0;
      }
    });
  }

  onSubmitExpense() {
    if (!this.selectedBudgetId || !this.selectedCategory || !this.description || !this.amount || this.amount <= 0) {
      return this.showError('Please fill in all fields correctly.');
    }
    if (this.amount > this.remainingBalance) {
      return Swal.fire({ icon: 'warning', title: 'Insufficient Funds', text: `Available: ₹${this.remainingBalance}` });
    }

    const expenseDto = {
      budgetId: this.selectedBudgetId,
      category: this.selectedCategory,
      description: this.description,
      amount: this.amount,
      department: this.userDepartment,
      submittedByUserId: this.userId,
      userName: this.userName
    };

    this.expenseService.addExpense(expenseDto).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Submitted', timer: 1500, showConfirmButton: false });
        this.resetExpenseForm();
        this.expenseSubmitted.emit(); 
      },
      error: () => this.showError('Failed to submit expense.')
    });
  }

  // --- TOP UP LOGIC (Single implementation) ---

  async openTopUpModal() {
    if (!isPlatformBrowser(this.platformId) || !this.selectedBudgetId) return;
    const { Modal } = await import('bootstrap');
    const modalElement = document.getElementById('topUpModal');
    if (modalElement) {
      const modalInstance = new Modal(modalElement);
      modalInstance.show();
    }
  }

  async submitTopUp() {
    if (!this.topUpAmount || this.topUpAmount <= 0 || !this.topUpReason) {
      return this.showError('Please provide a valid amount and reason.');
    }
    
    // Inside submitTopUp()
const topUpDto = {
  budgetId: this.selectedBudgetId,
  amount: this.topUpAmount,
  reason: this.topUpReason,
  department: this.userDepartment, // Ensure this key matches your C# Property
  userName: this.userName,
  userRole: this.userRole,           // Ensure this key matches your C# Property
  approvingManagerName: this.selectedManagerName
};

    this.topRequestService.addRequest(topUpDto).subscribe({
      next: () => {
        this.closeTopUpModal();
        Swal.fire({ icon: 'success', title: 'Request Sent', text: `Sent to ${this.selectedManagerName}` });
        this.topUpAmount = 0;
        this.topUpReason = '';
      },
      error: () => this.showError('Failed to send top-up request.')
    });
  }

  private async closeTopUpModal() {
    if (!isPlatformBrowser(this.platformId)) return;
    const { Modal } = await import('bootstrap');
    const modalElement = document.getElementById('topUpModal');
    if (modalElement) {
      const modalInstance = (Modal as any).getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
    }
  }

  private resetExpenseForm() {
    this.description = '';
    this.selectedCategory = '';
    this.amount = undefined as any;
  }

  private showError(msg: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: msg });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Inside NewExpenseComponent class

/**
 * Displays the reason for rejection using SweetAlert2.
 * @param expense The expense object containing the status and reason
 */
showRejectedReason(expense: Expense) {
  if (expense.status !== 'Rejected') return;

  // Use the reason from the backend or a fallback if it's empty
  const reason = (expense as any).rejectionReason || 'No specific reason provided by the manager.';

  Swal.fire({
    title: 'Rejection Details',
    html: `
      <div class="text-start p-2">
        <p class="mb-2 fw-bold text-danger">
          <i class="bi bi-exclamation-octagon-fill me-2"></i>Status: Rejected
        </p>
        <div class="p-3 bg-light rounded border-start border-danger border-4">
          <label class="extra-small fw-bold text-muted text-uppercase d-block mb-1">Manager Note:</label>
          <span class="text-dark">${reason}</span>
        </div>
      </div>
    `,
    icon: 'error',
    confirmButtonText: 'Close',
    confirmButtonColor: '#dc3545',
    showCloseButton: true
  });
}
}