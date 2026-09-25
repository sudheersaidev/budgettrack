// src/app/service/financial.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
export interface AdminStats {
  totalApprovedExpenses: number;
  totalAllocatedBudget: number;
  approvedCount: number;
  rejectedCount: number;
}
export interface DepartmentUtilization {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
}
@Injectable({ providedIn: 'root' })
export class FinancialService {
  private apiUrl = 'https://localhost:7264/api/Financial';
  private userApiUrl = 'https://localhost:7264/api/Users';
 
  constructor(private http: HttpClient) {}
 
  getAdminHeaderStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/header-stats`);
  }
  getDepartmentUtilization(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/department-utilization`);
}
getAllManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userApiUrl}/all-managers`);
  }
 
  /**
   * Calls the transfer ownership logic
   * Error handling for "Pending Expenses" is managed in the component
   */
  transferBudgetOwnership(budgetId: string, newManagerName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer-ownership`, {
      budgetId,
      newManagerName
    });
  }
}