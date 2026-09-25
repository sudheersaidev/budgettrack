import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopRequestService, TopUpRequest } from '../../../../service/top-request.service';
import { AuthService } from '../../../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-notifications.component.html',
  styleUrl: './manager-notifications.component.css'
})
export class ManagerNotificationsComponent implements OnInit {
  pendingRequests: TopUpRequest[] = [];
  managerDept: string = '';

  constructor(
    private topRequestService: TopRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.managerDept = user?.department || '';
    this.loadNotifications();
  }

  loadNotifications() {
    // 🔹 FIX: Subscribe to get the list
    this.topRequestService.getAllRequests().subscribe({
      next: (allRequests: TopUpRequest[]) => {
        this.pendingRequests = allRequests.filter((req: TopUpRequest) => 
          req.department === this.managerDept && req.status === 'Pending'
        );
      }
    });
  }

  handleAction(request: TopUpRequest, action: 'Approved' | 'Rejected') {
    // 🔹 FIX: Ensure requestId is defined
    if (!request.requestId) {
      console.error("Request ID is missing");
      return;
    }

    const actionText = action === 'Approved' ? 'approve' : 'reject';
    
    Swal.fire({
      title: `Confirm ${action}?`,
      text: `Are you sure you want to ${actionText} the request for ₹${request.amount}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'Approved' ? '#198754' : '#dc3545',
      confirmButtonText: `Yes, ${action}`
    }).then((result) => {
      if (result.isConfirmed) {
        // 🔹 FIX: Subscribe to service calls so they actually execute
        this.topRequestService.updateRequestStatus(request.requestId!, action).subscribe(() => {
          
          if (action === 'Approved') {
            this.topRequestService.updateBudgetBalance(request.budgetId, request.amount).subscribe(() => {
              this.loadNotifications();
            });
          } else {
            this.loadNotifications();
          }

          Swal.fire('Updated!', `Request has been ${action}.`, 'success');
        });
      }
    });
  }
}