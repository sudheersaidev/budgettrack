import { Component, Input, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2'; 

Chart.register(...registerables);

@Component({
  selector: 'app-budget-utilization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-utilization.component.html',
  styleUrl: './budget-utilization.component.css'
})
export class BudgetUtilizationComponent implements OnChanges, AfterViewInit {
  @Input() budgets: any[] = [];
  @Input() userDept: string = '';
  @Input() userName: string = '';

  private chartInstance: any;

  // Centralized color palette to ensure consistency between Chart and Legend
  private readonly colorPalette = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

  get totalDeptBudget(): number {
    return this.budgets.reduce((sum, b) => sum + (b.amountAllocated || 0), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budgets']) {
      setTimeout(() => this.renderChart(), 0);
    }
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  confirmDownload() {
    Swal.fire({
      title: 'Generate PDF Report?',
      text: "This will export the current department budget overview.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4e73df',
      cancelButtonColor: '#858796',
      confirmButtonText: 'Yes, Download',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadReport();
        Swal.fire({
          title: 'Downloaded!',
          text: 'Your report has been generated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

 downloadReport() {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-IN');

  // Header Styling
  doc.setFontSize(20);
  doc.setTextColor(78, 115, 223); // Primary Blue
  doc.text(`IT Department Budget Report`, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Department: ${this.userDept}`, 14, 28);
  doc.text(`Report Generated: ${date}`, 14, 34);

  // Prepare Data: Include Manager Name for ALL entries
  const tableData = this.budgets.map(b => [
    b.budgetId,
    b.title,
    b.createdByManager || 'System / Admin', // Shows the specific manager who created it
    `INR ${Number(b.amountAllocated).toLocaleString('en-IN')}`,
    b.status
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['Budget ID', 'Project Title', 'Manager Name', 'Allocation', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [78, 115, 223],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 30 }, // ID
      1: { cellWidth: 'auto' }, // Title
      2: { cellWidth: 40 }, // Manager Name
      3: { halign: 'right', cellWidth: 35 }, // Amount
      4: { halign: 'center', cellWidth: 25 }  // Status
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    didParseCell: (data) => {
      // Color coding the status in the PDF
      if (data.column.index === 4 && data.cell.section === 'body') {
        if (data.cell.raw === 'Active') {
          data.cell.styles.textColor = [28, 200, 138]; // Success Green
        } else {
          data.cell.styles.textColor = [231, 74, 59]; // Danger Red
        }
      }
    }
  });

  // Footer
  const totalAmount = this.budgets.reduce((sum, b) => sum + (Number(b.amountAllocated) || 0), 0);
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Total Department Allocation: INR ${totalAmount.toLocaleString('en-IN')}`, 14, finalY + 10);

  doc.save(`${this.userDept}_Full_Department_Report.pdf`);
}
  renderChart() {
    const canvas = document.getElementById('budgetDoughnutChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.budgets.map(b => b.title),
        datasets: [{
          data: this.budgets.map(b => b.amountAllocated),
          // Use the fixed palette here
          backgroundColor: this.colorPalette,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '75%'
      }
    });
  }

  
  getStaticColor(index: number): string {
    return this.colorPalette[index % this.colorPalette.length];
  }
}