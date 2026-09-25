import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExpenseService, Expense, DashboardStats } from '../../../../service/expense.service';
import { AuthService } from '../../../../service/auth.service';
import { CategoryService, Category } from '../../../../service/category.service';
import { NavbarManagerComponent } from '../navbar-manager/navbar-manager.component';
import { TopUpRequestComponent } from '../top-up-request/top-up-request.component';
import Swal from 'sweetalert2';

type ViewMode = 'APPROVED' | 'PENDING' | 'REJECTED' | 'TOP_REQUEST';

@Component({
  selector: 'app-approval-request',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarManagerComponent, RouterLink, TopUpRequestComponent],
  templateUrl: './approval-request.component.html',
  styleUrl: './approval-request.component.css'
})
export class ApprovalRequestComponent implements OnInit {
  userName = '';
  userRole = '';
  userDepartment = ''; 

  allDepartmentExpenses: Expense[] = []; 
  filteredExpenses: Expense[] = [];
  currentView: ViewMode = 'PENDING';
  
  selectedCategory: string = 'All';
  categories: string[] = [];

  // Values for the 3 Dashboard Cards
  totalAmount = 0;      // Total Expense Department
  pendingAmount = 0;    // Pending In Queue
  approvedAmount = 0;   // Approved Total

  showRejectPopup = false;
  rejectReason = '';
  selectedExpense: Expense | null = null;

  constructor(
    private expenseService: ExpenseService, 
    private authService: AuthService,
    private categoryService: CategoryService 
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name;
      this.userRole = user.role;
      this.userDepartment = user.department; 
    }

    this.categoryService.getCategories().subscribe((allCats: Category[]) => {
      this.categories = allCats.filter(cat => cat.enabled).map(cat => cat.name);
    });

    this.loadData();
  }

  loadData() {
    // Fetch live totals for the cards
    this.expenseService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.approvedAmount = stats.totalDeptBudget;
        this.pendingAmount = stats.pendingApprovals;
        this.totalAmount = stats.totalExpenseAmount;
      },
      error: (err) => console.error('Error fetching stats', err)
    });

    // Fetch the table records
    this.expenseService.getExpense().subscribe({
      next: (data: Expense[]) => {
        this.allDepartmentExpenses = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching expenses', err)
    });
  }

  setView(mode: ViewMode) {
    this.currentView = mode;
    this.applyFilters();
  }

  applyFilters() {
    let temp = [...this.allDepartmentExpenses];

    if (this.currentView === 'APPROVED') {
      temp = temp.filter(e => e.status === 'Approved');
    } else if (this.currentView === 'PENDING') {
      temp = temp.filter(e => e.status === 'Pending');
    } else if (this.currentView === 'REJECTED') {
      temp = temp.filter(e => e.status === 'Rejected');
    }

    if (this.selectedCategory !== 'All') {
      temp = temp.filter(e => e.category === this.selectedCategory);
    }

    this.filteredExpenses = temp;
  }

  approveExpense(expense: Expense) {
    this.expenseService.updateExpenseStatus(expense.expenseId, 'Approved').subscribe({
      next: () => {
        Swal.fire('Approved!', 'Expense status updated.', 'success');
        this.loadData(); // Refresh cards and table
      }
    });
  }

  openRejectPopup(expense: Expense) { 
    this.selectedExpense = expense; 
    this.showRejectPopup = true; 
  }

  confirmReject() {
    if (this.selectedExpense) {
      this.expenseService.updateExpenseStatus(
        this.selectedExpense.expenseId, 
        'Rejected', 
        this.rejectReason || 'No reason provided'
      ).subscribe({
        next: () => {
          this.showRejectPopup = false;
          this.rejectReason = '';
          Swal.fire('Rejected', 'Expense has been declined.', 'info');
          this.loadData(); // Refresh cards and table
        }
      });
    }
  }

  closeRejectPopup() { 
    this.showRejectPopup = false; 
    this.rejectReason = '';
  }

  onCategoryChange() { this.applyFilters(); }
  openModal() { /* Modal Logic */ }
}