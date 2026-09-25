import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../../../service/manager.service';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-department-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-overview.component.html',
  styleUrl: './department-overview.component.css'
})
export class DepartmentOverviewComponent implements OnInit {
  departmentBudgets: any[] = [];
  managerDept: string = '';
  totalAllocated: number = 0;

  constructor(
    private managerService: ManagerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  const user = this.authService.getUser();
  this.managerDept = user?.department || '';

  if (this.managerDept) {
    // Fix: Subscribe to the data stream
    this.managerService.getBudgetsByDepartment(this.managerDept).subscribe({
      next: (data) => {
        this.departmentBudgets = data;
        this.calculateTotal();
      }
    });
  }
}

  calculateTotal() {
    this.totalAllocated = this.departmentBudgets.reduce((acc, curr) => acc + curr.amountAllocated, 0);
  }
}