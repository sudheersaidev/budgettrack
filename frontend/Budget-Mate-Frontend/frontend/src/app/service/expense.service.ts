import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Expense {
  expenseId: string;
  budgetId: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  department: string;
  submittedByUserId: string;
  userName: string;
  submittedDate: string;
  rejectionReason?: string;
}

export interface DashboardStats {
  department: string;
  totalDeptBudget: number;
  pendingApprovals: number;
  totalExpenseAmount: number;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = 'https://localhost:7264/api'; 
  
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Dashboard Stats for Manager
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/Approval/dashboard-stats`);
  }

  // Main Expense Fetching (Department wide)
  getExpense(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/Approval/my-dept-expenses`);
  }

  // Stats for Employee Dashboard
  getTotalDeptBudget(): Observable<{ totalDeptBudget: number }> {
    return this.http.get<{ totalDeptBudget: number }>(`${this.apiUrl}/Expenses/total-dept-budget`);
  }

  getPendingApprovals(): Observable<{ pendingApprovals: number }> {
    return this.http.get<{ pendingApprovals: number }>(`${this.apiUrl}/Expenses/pending-approvals`);
  }

  // Update Status for Manager
  updateExpenseStatus(id: string, status: string, reason: string = 'No Rejection'): Observable<any> {
    const payload = { status, rejectionReason: reason };
    return this.http.put(`${this.apiUrl}/Approval/${id}/status`, payload);
  }

  // Submit Expense for Employee
  addExpense(expense: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Expenses/submit`, expense).pipe(
      tap(() => this.refreshExpenses()) 
    );
  }

  // FETCH ONLY BUDGETS ASSIGNED TO THE CURRENT LOGGED-IN EMPLOYEE
  // Update this method in expense.service.ts
getEmployeeAssignedBudgets(): Observable<any[]> { // Changed string[] to any[]
  return this.http.get<any[]>(`${this.apiUrl}/Expenses/my-assigned-budgets`);
}
// service/expense.service.ts

getEmployeeExpenseHistory(): Observable<Expense[]> {
  // Swagger proves this works!
  return this.http.get<Expense[]>(`${this.apiUrl}/Expenses/my-dept-expenses`);
}
getAllDeptExpenses(): Observable<Expense[]> {
  return this.http.get<Expense[]>(`${this.apiUrl}/Expenses/all-dept-expenses`);
}
// service/expense.service.ts

refreshExpenses(): void {
  // Use the employee-specific history method you created
  this.getEmployeeExpenseHistory().subscribe({
    next: (data) => {
      console.log('User History Loaded:', data); // Should now show E3001, E3003, etc.
      this.expensesSubject.next(data);
    },
    error: (err) => console.error('History Error:', err)
  });
}
}