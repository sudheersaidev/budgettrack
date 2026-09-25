import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../service/auth.service';
import { TopRequestService, TopUpRequest } from '../../../../service/top-request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-top-up-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-up-request.component.html',
  styleUrl: './top-up-request.component.css'
})
export class TopUpRequestComponent implements OnInit { 
  pendingRequests: TopUpRequest[] = [];
  requestHistory: TopUpRequest[] = [];
  userDepartment: string = '';

  constructor(
    private topRequestService: TopRequestService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) { 
      this.userDepartment = user.department; 
    }
    this.loadRequests();
  }

  loadRequests() {
  this.topRequestService.getManagerApprovals().subscribe({
    next: (data: TopUpRequest[]) => {
      // Correctly splits the combined data from the backend
      this.pendingRequests = data.filter(req => req.status === 'Pending');
      this.requestHistory = data.filter(req => req.status !== 'Pending');
      console.log(this.requestHistory);
    },
    error: (err) => console.error(err)
    
  });
}
  approveRequest(request: TopUpRequest) {
    if (!request.requestId) return;

    Swal.fire({
      title: 'Confirm Approval',
      text: `Approve ₹${request.amount} for Budget ${request.budgetId}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Yes, Approve'
    }).then((result) => {
      if (result.isConfirmed) {
        // 🔹 Execute status update via API
        this.topRequestService.updateRequestStatus(request.requestId!, 'Approved').subscribe(() => {
          // 🔹 Update balance via API
          this.topRequestService.updateBudgetBalance(request.budgetId, request.amount).subscribe(() => {
            this.loadRequests(); // Refresh lists
            Swal.fire('Updated!', 'Budget balance has been increased.', 'success');
          });
        });
      }
    });
  }

  // top-up-request.component.ts

rejectRequest(requestId: string | undefined) {
  if (!requestId) return;

  Swal.fire({
    title: 'Reject Request',
    input: 'textarea',
    inputLabel: 'Please provide a reason for rejection',
    inputPlaceholder: 'Enter reason here...',
    inputAttributes: {
      'aria-label': 'Type your message here'
    },
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Submit Rejection',
    preConfirm: (reason) => {
      if (!reason) {
        Swal.showValidationMessage('Rejection reason is required');
      }
      return reason;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Send both the status and the rejectedReason to the service
      this.topRequestService.updateRequestStatus(requestId, 'Rejected', result.value).subscribe({
        next: () => {
          this.loadRequests(); // Refresh lists
          Swal.fire('Rejected', 'The request has been rejected.', 'info');
        },
        error: (err) => {
          console.error('Error rejecting request', err);
          Swal.fire('Error', 'Failed to update request status', 'error');
        }
      });
    }
  });
}
}