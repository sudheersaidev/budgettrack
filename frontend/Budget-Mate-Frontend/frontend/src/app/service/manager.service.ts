import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private apiUrl = 'https://localhost:7264/api/Budgets'; 

  constructor(private http: HttpClient) {}

  // Fix: Added optional 'dept' parameter to match component calls
  getBudgetsByDepartment(dept?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Fix: Added missing 'totalBudget' method
  totalBudget(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/total-summary`);
  }

  addBudget(budget: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, budget);
  }

  updateBudgetStatus(budgetId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/close/${budgetId}`, {});
  }

  // NEW: Reactivate method
  reactivateBudget(budgetId: string): Observable<any> {
    // This assumes your backend has a corresponding PUT endpoint for activation
    return this.http.put<any>(`${this.apiUrl}/activate/${budgetId}`, {});
  }
  getActiveBudgetIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/active-ids`);
  }
  // Example of what should be in your expense.service.ts
getEmployeeAssignedBudgets(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/active-ids`);
}
}