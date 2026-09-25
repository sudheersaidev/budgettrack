import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopUpRequest {
  requestId?: string; 
  userName: string;
  userRole: string;
  department: string;
  budgetId: string;
  amount: number;
  reason: string;
  status: string;
  submittedDate: string;
  rejectedReason?: string; 
  approvingManagerName?: string; // Added to match your DB structure
}

@Injectable({
  providedIn: 'root'
})
export class TopRequestService {
  private apiUrl = 'https://localhost:7264/api/TopRequest';

  constructor(private http: HttpClient) {}

  // 1. Get ALL requests (Administrative view)
  getAllRequests(): Observable<TopUpRequest[]> {
    return this.http.get<TopUpRequest[]>(`${this.apiUrl}/all`);
  }

  // 🔹 2. NEW: Get requests specifically for the logged-in Manager
  // This calls the [HttpGet("my-approvals")] endpoint in your Controller
  getManagerApprovals(): Observable<TopUpRequest[]> {
    return this.http.get<TopUpRequest[]>(`${this.apiUrl}/my-approvals`);
  }

  // 3. Submit a new top-up request
  addRequest(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, request);
  }

  // 4. Update status (Approve/Reject)
  updateRequestStatus(requestId: string, status: string, rejectedReason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-status`, { 
      requestId, 
      status, 
      rejectedReason: rejectedReason || null 
    });
  }

  // 5. Update the actual budget balance after approval
  updateBudgetBalance(budgetId: string, amount: number): Observable<any> {
     return this.http.put(`${this.apiUrl}/update-balance`, { budgetId, amount });
  }
}