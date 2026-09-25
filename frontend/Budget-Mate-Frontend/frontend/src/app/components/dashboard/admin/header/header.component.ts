// src/app/components/admin/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialService, AdminStats } from '../../../../service/financial.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  totalExpenses: number = 0;
  totalAllocated: number = 0;
  remainingBudget: number = 0;
  utilizationRate: number = 0;
  approvalRate: number = 0; 
  approvedCount: number = 0;
  rejectedCount: number = 0;

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.loadAdminData(); // Single call is better
  }

  loadAdminData() {
    this.financialService.getAdminHeaderStats().subscribe({
      next: (data: AdminStats) => {
        // Debug here to see what the backend is actually sending
        console.log('Admin Stats Data:', data);

        this.totalExpenses = data.totalApprovedExpenses || 0;
        this.totalAllocated = data.totalAllocatedBudget || 0;
        this.remainingBudget = data.totalAllocatedBudget || 0;
        this.approvedCount = data.approvedCount || 0;
        this.rejectedCount = data.rejectedCount || 0;

        this.calculateRates();
      },
      error: (err) => console.error('Error fetching admin stats:', err)
    });
  }

  private calculateRates() {
    const totalProcessed = this.approvedCount + this.rejectedCount;
    
    // Approval Rate calculation
    this.approvalRate = totalProcessed > 0 
      ? Math.round((this.approvedCount / totalProcessed) * 100) 
      : 0;

    // Utilization Rate calculation
    // Ensure totalAllocated is > 0 to avoid division by zero
    console.log("Total Expenses : "+this.totalExpenses);
    console.log("Total Allocation : "+this.totalAllocated);
    console.log("Total Processed : "+totalProcessed);
    if (this.totalAllocated > 0) {
      this.utilizationRate = Math.round((this.totalExpenses / this.totalAllocated) * 100);
      console.log(this.utilizationRate);
    } else {
      this.utilizationRate = 0;
    }
  }
}