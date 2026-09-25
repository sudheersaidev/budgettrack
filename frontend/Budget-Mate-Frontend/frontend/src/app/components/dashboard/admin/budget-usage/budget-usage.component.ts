import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialService, DepartmentUtilization } from '../../../../service/financial.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-budget-usage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-usage.component.html',
  styleUrl: './budget-usage.component.css'
})
export class BudgetUsageComponent implements OnInit {
  isGenerating = false;
  departments: DepartmentUtilization[] = [];

  constructor(private financialService: FinancialService) {}

  ngOnInit() {
    this.loadDepartmentalStats();
  }

  loadDepartmentalStats() {
    this.financialService.getDepartmentUtilization().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Error fetching department stats', err);
        Swal.fire('Error', 'Could not load departmental budget data.', 'error');
      }
    });
  }

  public async generateReport(): Promise<void> {
    const result = await Swal.fire({
      title: 'Generate Report?',
      text: "Would you like to download the Budget Utilization PDF?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e88e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Download'
    });

    if (result.isConfirmed) {
      this.isGenerating = true;
      try {
        const doc = new jsPDF();
        
        const tableData = this.departments.map(dept => [
          dept.name,
          `Rs. ${dept.allocated.toLocaleString()}`,
          `Rs. ${dept.spent.toLocaleString()}`,
          `Rs. ${dept.remaining.toLocaleString()}`,
          `${dept.utilization}%`
        ]);

        autoTable(doc, {
          startY: 25,
          head: [['Department', 'Allocated', 'Spent', 'Remaining', 'Utilization %']],
          body: tableData,
          theme: 'striped',
          headStyles: { 
            fillColor: [30, 136, 229],
            halign: 'center',
            valign: 'middle',
            fontStyle: 'bold'
          },
          styles: { 
            halign: 'center',
            valign: 'middle',
            fontSize: 10,
            cellPadding: 6 
          },
          columnStyles: {
            0: { halign: 'center' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' }
          },
          didDrawPage: (data) => {
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text("Budget Utilization Summary", 14, 15);
          }
        });

        doc.save(`Budget_Utilization_Report.pdf`);
        Swal.fire('Success', 'Your report has been downloaded.', 'success');
      } catch (error) {
        console.error('PDF Generation Error:', error);
        Swal.fire('Error', 'An error occurred while generating the PDF.', 'error');
      } finally {
        this.isGenerating = false;
      }
    }
  }
}