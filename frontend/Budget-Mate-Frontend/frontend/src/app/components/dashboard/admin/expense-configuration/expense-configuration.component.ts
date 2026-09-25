import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';
import { ExpenseService } from '../../../../service/expense.service';
import { CategoryService, Category } from '../../../../service/category.service';

@Component({
  selector: 'app-expense-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-configuration.component.html',
  styleUrls: ['./expense-configuration.component.css']
})
export class ExpenseConfigurationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('expenseChart') expenseChart!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | undefined;
  categories: Category[] = [];
  newCategoryName = '';
  totalSpentLabel = '₹0';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private expenseService: ExpenseService,
    private categoryService: CategoryService 
  ) {
    // Subscribe to the BehaviorSubject in CategoryService for real-time updates
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDistributionChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  loadDistributionChart() {
  // Use getAllDeptExpenses to get data for the entire department
  this.expenseService.getAllDeptExpenses().subscribe(expenses => {
    const deptTotals: { [key: string]: number } = {};
    let totalSum = 0;

    expenses.forEach(e => {
      // 1. Only include Approved expenses for the spending chart if desired, 
      // or all if you want to show total requested volume.
      // Usually, 'Distribution' implies actual spending (Approved).
      if (e.status === 'Approved') { 
        const deptName = e.department || 'Unassigned';
        deptTotals[deptName] = (deptTotals[deptName] || 0) + e.amount;
        totalSum += e.amount;
      }
    });

    // 2. Format the Center Label (₹1.5L or ₹50K)
    if (totalSum >= 100000) {
      this.totalSpentLabel = `₹${(totalSum / 100000).toFixed(1)}L`;
    } else {
      this.totalSpentLabel = `₹${(totalSum / 1000).toFixed(0)}K`;
    }

    if (this.chart) this.chart.destroy();

    // 3. Generate Chart
    this.chart = new Chart(this.expenseChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(deptTotals),
        datasets: [{
          data: Object.values(deptTotals),
          backgroundColor: [
            '#3b82f6', // IT
            '#10b981', // Finance
            '#f59e0b', // Marketing
            '#8b5cf6' // HR
            
          ],
          borderWidth: 0, // Clean look
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%', // Thinner ring for more modern UI
        plugins: {
          legend: { 
            display: true,
            position: 'bottom', 
            labels: { 
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { size: 12, weight: 'bold' }
            } 
          },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            callbacks: {
              label: (item) => ` ₹${(item.raw as number).toLocaleString()}`
            }
          }
        }
      }
    });
  });
}
  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;
    
    // Check for duplicates locally before hitting the API
    if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      Swal.fire({ 
        title: 'Duplicate!', 
        text: 'This category already exists.',
        icon: 'error', 
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 2000 
      });
      return;
    }

    this.categoryService.addCategory(name);
    this.newCategoryName = '';
    Swal.fire({ title: 'Added!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  }

  // Passing the object ensures we have the ID for the API call
  deleteCategory(category: Category) {
    if(!category.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to remove "${category.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(category.id!);
        Swal.fire({ title: 'Removed', icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      }
    });
  }

  toggleCategory(category: Category) {
    this.categoryService.toggleCategory(category);
  }
}