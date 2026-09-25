import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recent-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-history.component.html',
  styleUrl: './recent-history.component.css'
})
export class RecentHistoryComponent implements OnChanges {
  // 1. Data Input from Parent
  @Input() budgets: any[] = [];

  // 2. Output to notify Parent of status changes
  @Output() statusChanged = new EventEmitter<any>();

  // 3. Local State Properties
  paginatedBudgets: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;
  Math = Math; 

  // 4. Lifecycle hook to handle data updates from Parent
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budgets']) {
      // If the data changes, we usually want to stay on the same page 
      // unless the current page is now empty
      this.updatePagination();
    }
  }

  // 5. Logic to slice data for the current view
  updatePagination() {
    const list = this.budgets || [];
    this.totalPages = Math.ceil(list.length / this.itemsPerPage) || 1;
    
    // Safety check: if current page is greater than total pages after deletion
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedBudgets = list.slice(start, start + this.itemsPerPage);
  }

  // 6. Status Toggle Logic
  toggleStatus(budget: any) {
    const newStatus = budget.status === 'Active' ? 'Closed' : 'Active';
    const actionText = newStatus === 'Closed' ? 'close' : 'reactivate';

    Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${actionText} the budget for "${budget.title}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Closed' ? '#e74a3b' : '#1cc88a',
      cancelButtonColor: '#858796',
      confirmButtonText: `Yes, ${newStatus} it!`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // We emit the whole object with the new status to the parent
        this.statusChanged.emit({ ...budget, status: newStatus });
        
        Swal.fire({
          title: 'Updated!',
          text: `Budget status set to ${newStatus}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  // 7. Navigation Methods
  // pagination it will move this next page
  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  //pagination if it i click the previous page it should be moved through previous page
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  // FIXED: Renamed from toggleStatus to handleStatusUpdate to match your HTML
  handleStatusUpdate(budget: any) {
    const isClosing = budget.status === 'Active';
    const newStatus = isClosing ? 'Closed' : 'Active';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${isClosing ? 'Close' : 'Reactivate'} "${budget.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isClosing ? '#e74a3b' : '#1cc88a',
      confirmButtonText: `Yes, ${newStatus} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        // Emit to ManagerComponent to perform the API call
        this.statusChanged.emit(budget);
      }
    });
  }
}