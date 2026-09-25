import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../../service/expense.service';
import { TopRequestService, TopUpRequest } from '../../../../service/top-request.service';
import { AuthService } from '../../../../service/auth.service';
import Swal from 'sweetalert2'; 

interface Notification {
  id: string;
  type: 'Expense' | 'Top-Up';
  message: string;
  date: Date;
  status: string;
  budgetId: string;
  department: string;
  rejectionReason?: string; 
}

@Component({
  selector: 'app-notifications-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-employees.component.html',
  styleUrl: './notifications-employees.component.css'
})
export class NotificationsEmployeesComponent implements OnInit {
  notifications: Notification[] = [];
  currentUserId: string = '';

  constructor(
    private expenseService: ExpenseService,
    private topRequestService: TopRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.currentUserId = user?.userId || '';
    this.loadNotifications();
  }

  loadNotifications() {
    const currentUser = this.authService.getUser();

    this.expenseService.getExpense().subscribe(expenses => {
      const combinedNotifications: Notification[] = [];
      
      // 1. Map Expense Notifications
      const userExpenses = expenses.filter(e => e.submittedByUserId === this.currentUserId);
      userExpenses.forEach(e => {
        combinedNotifications.push({
          id: e.expenseId,
          type: 'Expense',
          message: `Your expense claim ${e.expenseId} has been ${e.status.toLowerCase()}.`,
          date: new Date(e.submittedDate),
          status: e.status,
          budgetId: e.budgetId,
          department: e.department,
          // FIX for TS2339: Using (e as any) to allow checking multiple backend field names
          rejectionReason: (e as any).rejectionReason || (e as any).rejectedReason || (e as any).reason || ''
        });
      });

      // 2. Map Top-Up Request Notifications
      this.topRequestService.getAllRequests().subscribe(topUps => {
        const userTopUps = topUps.filter((r: TopUpRequest) => r.userName === currentUser.name);
        
        userTopUps.forEach(r => {
          combinedNotifications.push({
            id: r.requestId || 'N/A',
            type: 'Top-Up',
            message: `Your top-up request for Budget ${r.budgetId} is ${r.status.toLowerCase()}.`,
            date: new Date(r.submittedDate),
            status: r.status,
            budgetId: r.budgetId,
            department: r.department,
            // FIX for TS2339: Using (r as any) for top-up objects
            rejectionReason: (r as any).rejectionReason || (r as any).rejectedReason || (r as any).reason || ''
          });
        });

        // 3. Sort and Assign
        this.notifications = combinedNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
      });
    });
  }

  /**
   * Shows the rejection reason in a popup using SweetAlert2.
   */
  showRejectedReason(note: Notification) {
    // Standardize status check to avoid case-sensitivity issues
    if (note.status.toUpperCase() !== 'REJECTED') return;

    const reason = note.rejectionReason || 'No specific reason provided by the manager.';

    Swal.fire({
      title: 'Request Rejected',
      html: `
        <div class="text-start p-2">
          <div class="d-flex align-items-center mb-3 text-danger">
            <i class="bi bi-x-circle-fill fs-4 me-2"></i>
            <span class="fw-bold">Status: Rejected</span>
          </div>
          <div class="p-3 bg-light rounded border-start border-danger border-4">
            <small class="text-muted fw-bold text-uppercase d-block mb-1">Feedback:</small>
            <p class="mb-0 text-dark">"${reason}"</p>
          </div>
          <div class="mt-3 extra-small text-muted text-center">Reference ID: ${note.id}</div>
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Close',
      confirmButtonColor: '#dc3545',
      showCloseButton: true
    });
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'approved') return 'bg-success';
    if (s === 'pending') return 'bg-warning text-dark';
    if (s === 'rejected') return 'bg-danger';
    return 'bg-secondary';
  }
}