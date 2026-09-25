import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialService } from '../../../../service/financial.service';
import { ManagerService } from '../../../../service/manager.service';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-budget-manager-change',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-manager-change.component.html',
  styleUrl: './budget-manager-change.component.css'
})
export class BudgetManagerChangeComponent implements OnInit {
  // Data lists
  budgets: any[] = [];
  managers: any[] = [];
 
  // Form bindings
  selectedBudgetId: string = '';
  selectedManagerName: string = '';
 
  // UI State
  loading: boolean = false;
 
  constructor(
    private financialService: FinancialService,
    private managerService: ManagerService
  ) {}
 
  ngOnInit(): void {
    this.refreshData();
  }
 
  /**
   * Loads budgets and managers.
   * Handled with standard console logs for background loading.
   */
  refreshData(): void {
    this.managerService.getBudgetsByDepartment().subscribe({
      next: (data) => this.budgets = data,
      error: (err) => console.error('Error fetching budgets:', err)
    });
 
    this.financialService.getAllManagers().subscribe({
      next: (data) => this.managers = data,
      error: (err) => console.error('Error fetching managers:', err)
    });
  }
 
  /**
   * Submits the transfer request using SweetAlert2 for all user interactions.
   */
  async submitTransfer(): Promise<void> {
  // 1. Basic Local Validation
  if (!this.selectedBudgetId || !this.selectedManagerName) {
    this.showErrorSwal('Selection Required', 'Please select both a budget and a manager.');
    return;
  }

  // Find the objects for deep validation
  const budget = this.budgets.find(b => b.budgetId === this.selectedBudgetId);
  const manager = this.managers.find(m => m.name === this.selectedManagerName);

  // 2. Prevent Self-Transfer
  if (budget.createdByManager === this.selectedManagerName) {
    this.showErrorSwal('Invalid Transfer', `${this.selectedManagerName} is already the owner of this budget.`);
    return;
  }

  // 3. Department Check
  if (budget.department !== manager.department) {
    this.showErrorSwal('Department Mismatch', 
      `Budget belongs to ${budget.department}, but ${manager.name} is in ${manager.department}.`);
    return;
  }

  // 4. Confirmation Dialog
  const result = await Swal.fire({
    title: 'Confirm Transfer',
    text: `Transfer ${budget.title} to ${manager.name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, transfer'
  });

  if (result.isConfirmed) {
    this.loading = true;
    Swal.showLoading();

    this.financialService.transferBudgetOwnership(this.selectedBudgetId, this.selectedManagerName)
      .subscribe({
        next: (res) => {
          this.loading = false;
          Swal.fire('Success', res.message, 'success');
          this.refreshData();
        },
        error: (err) => {
          this.loading = false;
          this.showErrorSwal('Transfer Failed', err.error?.message || 'Pending expenses detected.');
        }
      });
  }
}

// Helper to keep code clean
private showErrorSwal(title: string, text: string) {
  Swal.fire({ icon: 'error', title, text });
}
}