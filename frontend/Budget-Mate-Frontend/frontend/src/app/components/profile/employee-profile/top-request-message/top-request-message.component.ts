import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopRequestService, TopUpRequest } from '../../../../service/top-request.service';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-top-request-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-request-message.component.html',
  styleUrl: './top-request-message.component.css'
})
export class TopRequestMessageComponent implements OnInit {
  userRequests: TopUpRequest[] = [];
  
  // Changed type to 'any' to avoid the property missing error
  showModal: boolean = false;
  selectedRequest: any = null; 

  constructor(
    private topRequestService: TopRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyRequests();
  }

  loadMyRequests() {
    const currentUser = this.authService.getUser();
    if (!currentUser) return;

    this.topRequestService.getAllRequests().subscribe({
      next: (requests: TopUpRequest[]) => {
        this.userRequests = requests
          .filter((r: TopUpRequest) => r.userName === currentUser.name)
          .sort((a: TopUpRequest, b: TopUpRequest) => 
            new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
          );
      },
      error: (err: any) => console.error(err)
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  openRejectionModal(req: any): void {
    this.selectedRequest = req;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequest = null;
  }
}