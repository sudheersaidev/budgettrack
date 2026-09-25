import { AfterViewInit, Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { AuthService } from '../../../service/auth.service';
import { ManagerService } from '../../../service/manager.service';

// External Libraries
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

// Components
import { NavbarManagerComponent } from './navbar-manager/navbar-manager.component';
import { RecentHistoryComponent } from './recent-history/recent-history.component';
import { BudgetUtilizationComponent } from './budget-utilization/budget-utilization.component';

Chart.register(...registerables);

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NavbarManagerComponent, 
    RecentHistoryComponent, 
    BudgetUtilizationComponent
  ],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css'
})
export class ManagerComponent implements OnInit, AfterViewInit {
  userName = '';
  userRole = '';
  userDept = '';
  isProfileDropdownOpen = false;

  budgets: any[] = [];
  filteredBudgets: any[] = [];
  
  // Dropdown Assignment Variables
  deptEmployees: any[] = [];
  selectedEmployees: any[] = [];
  employeeSearchText = ''; 
  showEmployeeDropdown = false; 

  searchText = '';
  showModal = false;
  submitted = false;
  activeTab: 'history' | 'utilization' = 'history';
  
  Math = Math;

  newBudget: any = {
    budgetId: '',
    title: '',
    department: '',
    amountAllocated: null,
    startDate: '',
    endDate: '',
    status: 'Active',
    assignedEmployees: [],
    createdByManager: '' // New property to track the creator
  };

  private chartInstance: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private managerService: ManagerService,
    private eRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showEmployeeDropdown = false;
    }
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name;
      this.userRole = user.role;
      this.userDept = user.department;
      this.loadBudgets(); 
      this.loadDeptEmployees(); 
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  loadBudgets() {
  this.managerService.getBudgetsByDepartment().subscribe({
    next: (data) => {
      this.budgets = data;
      this.onSearch(); // This now filters to only YOUR budgets
      this.renderChart();
    },
    error: (err) => console.error('Failed to load budgets', err)
  });
}
  loadDeptEmployees() {
    this.authService.getUsersByDepartment(this.userDept).subscribe(users => {
      this.deptEmployees = users
        .filter(u => u.role === 'Employee')
        .sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  get filteredEmployees() {
    return this.deptEmployees.filter(emp => 
      emp.name.toLowerCase().includes(this.employeeSearchText.toLowerCase()) ||
      emp.userID.toLowerCase().includes(this.employeeSearchText.toLowerCase())
    );
  }

  toggleDropdownMenu(event: Event) {
    event.stopPropagation();
    this.showEmployeeDropdown = !this.showEmployeeDropdown;
  }

  toggleEmployeeSelection(emp: any) {
    const index = this.selectedEmployees.findIndex(e => e.userID === emp.userID);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push({ userID: emp.userID, name: emp.name });
    }
  }

  isEmployeeSelected(empId: string): boolean {
    return this.selectedEmployees.some(e => e.userID === empId);
  }

  removeEmployee(empId: string, event?: Event) {
    if(event) event.stopPropagation();
    this.selectedEmployees = this.selectedEmployees.filter(e => e.userID !== empId);
  }

  selectAllFiltered() {
    this.filteredEmployees.forEach(emp => {
      if (!this.isEmployeeSelected(emp.userID)) {
        this.selectedEmployees.push({ userID: emp.userID, name: emp.name });
      }
    });
  }

  /**
   * REVISED ADD BUDGET LOGIC
   * Includes duplicate ID check and Date Timeline validation
   */
  addBudget() {
    this.submitted = true;

    // 1. Mandatory Field Validation
    if (!this.newBudget.budgetId || !this.newBudget.title || !this.newBudget.amountAllocated || !this.newBudget.startDate || !this.newBudget.endDate) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please fill in all required fields.', confirmButtonColor: '#4e73df' });
      return;
    }

    // 2. Duplicate Budget ID Check
    const isDuplicate = this.budgets.some(b => b.budgetId.trim().toLowerCase() === this.newBudget.budgetId.trim().toLowerCase());
    if (isDuplicate) {
      Swal.fire({ icon: 'error', title: 'Duplicate ID', text: `Budget ID "${this.newBudget.budgetId}" already exists.`, confirmButtonColor: '#e74a3b' });
      return;
    }

    // 3. Timeline Validation
    const start = new Date(this.newBudget.startDate);
    const end = new Date(this.newBudget.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      Swal.fire({ icon: 'info', title: 'Invalid Start Date', text: 'Start Date cannot be in the past.', confirmButtonColor: '#36b9cc' });
      return;
    }
    if (start >= end) {
      Swal.fire({ icon: 'info', title: 'Timeline Error', text: 'End Date must be after the Start Date.', confirmButtonColor: '#36b9cc' });
      return;
    }

    // 4. Confirmation & API Call
    Swal.fire({
      title: 'Confirm New Budget',
      text: `Create budget "${this.newBudget.title}" for department ${this.userDept}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4e73df'
    }).then((result) => {
      if (result.isConfirmed) {
        this.newBudget.department = this.userDept;
        this.newBudget.assignedEmployees = this.selectedEmployees;
        this.newBudget.status = 'Active';
        this.newBudget.createdByManager = this.userName; // Track current manager

        this.managerService.addBudget({ ...this.newBudget }).subscribe({
          next: () => {
            this.loadBudgets();
            this.closeModal();
            this.resetForm();
            Swal.fire({ icon: 'success', title: 'Successfully Added!', timer: 1500, showConfirmButton: false });
          },
          error: (err) => Swal.fire('Error', 'Could not save budget.', 'error')
        });
      }
    });
  }

  handleStatusUpdate(updatedBudget: any) {
    const isCurrentlyActive = updatedBudget.status === 'Active';
    const actionRequest = isCurrentlyActive 
      ? this.managerService.updateBudgetStatus(updatedBudget.budgetId) 
      : this.managerService.reactivateBudget(updatedBudget.budgetId);

    actionRequest.subscribe({ next: () => this.loadBudgets() });
  }

  resetForm() {
    this.newBudget = { budgetId: '', title: '', department: this.userDept, amountAllocated: null, startDate: '', endDate: '', status: 'Active', assignedEmployees: [], createdByManager: '' };
    this.selectedEmployees = [];
    this.employeeSearchText = '';
    this.showEmployeeDropdown = false;
    this.submitted = false;
  }

  // --- Session Monitor with Live Clock ---
  showSessionInfo() {
    let timerInterval: any;
    Swal.fire({
      title: '<strong>Session Monitor</strong>',
      icon: 'info',
      html: `
        <div class="session-container text-start mt-3">
          <div class="d-flex align-items-center mb-3 p-2 bg-light rounded-3 border-start border-primary border-4">
            <div class="ms-2">
              <div class="text-muted small fw-bold text-uppercase">Active User</div>
              <div class="fw-bold text-dark">${this.userName}</div>
            </div>
          </div>
          <div class="d-flex align-items-center mb-4 p-2 bg-light rounded-3 border-start border-info border-4">
            <div class="ms-2">
              <div class="text-muted small fw-bold text-uppercase">Department</div>
              <div class="fw-bold text-dark">${this.userDept}</div>
            </div>
          </div>
          <div class="clock-box text-center p-3 rounded-4 shadow-sm" style="background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); color: white;">
            <div id="swal-live-clock" class="display-6 fw-bold mb-0">--:--:--</div>
            <div id="swal-live-date" class="small opacity-75"></div>
          </div>
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: '<i class="bi bi-check2-circle"></i> OK',
      confirmButtonColor: '#4e73df',
      didOpen: () => {
        const updateClock = () => {
          const now = new Date();
          const clockEl = document.getElementById('swal-live-clock');
          const dateEl = document.getElementById('swal-live-date');
          if (clockEl) clockEl.innerText = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          if (dateEl) dateEl.innerText = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        };
        updateClock();
        timerInterval = setInterval(updateClock, 1000);
      },
      willClose: () => { clearInterval(timerInterval); }
    });
  }

  // UI Support Methods
  switchTab(tab: 'history' | 'utilization') {
    this.activeTab = tab;
    if (tab === 'utilization') setTimeout(() => this.renderChart(), 0);
  }

  onSearch() {
  this.filteredBudgets = this.budgets.filter(b => {
    // 1. Must be created by the current manager
    const isMine = b.createdByManager === this.userName;
    
    // 2. Must match search text (if any)
    const matchesSearch = b.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          b.budgetId.toLowerCase().includes(this.searchText.toLowerCase());

    return isMine && matchesSearch;
  });
}

  get totalDeptBudget(): number { 
  return this.budgets
    .filter(b => b.createdByManager === this.userName)
    .reduce((sum, b) => sum + (Number(b.amountAllocated) || 0), 0); 
}
  get pendingApprovalsAmount(): number { 
  return this.budgets
    .filter(b => b.createdByManager === this.userName && b.status === 'Closed')
    .reduce((sum, b) => sum + (Number(b.amountAllocated) || 0), 0); 
}
  closeModal() { this.showModal = false; }
  toggleProfileDropdown() { this.isProfileDropdownOpen = !this.isProfileDropdownOpen; }
  logout() { this.authService.logout(); }
  onClickApproval() { this.router.navigate(['/approvalList']); }
  
  renderChart() {
    const canvas = document.getElementById('budgetDoughnutChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (this.chartInstance) this.chartInstance.destroy();
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.filteredBudgets.map(b => b.title),
        datasets: [{
          data: this.filteredBudgets.map(b => b.amountAllocated),
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
          borderWidth: 1
        }]
      },
      options: { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
    });
  }

  downloadReport() {
    const doc = new jsPDF();
    autoTable(doc, { head: [['ID', 'Title', 'Amount', 'Status']], body: this.budgets.map(b => [b.budgetId, b.title, b.amountAllocated, b.status]) });
    doc.save(`Budget_Report.pdf`);
  }
  openModal() {
  this.showModal = true;
  this.resetForm();
}
}