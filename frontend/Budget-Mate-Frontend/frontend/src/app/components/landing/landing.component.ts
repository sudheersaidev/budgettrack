import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    { title: 'Project Budgeting', icon: '🌱', desc: 'Specific funds to individual projects or users to monitor real-time expenses.' },
    { title: 'Expense Approvals', icon: '¥', desc: 'Set up custom workflows for managers to review and approve employee reimbursements in one click.' },
    { title: 'Smarter Budgets', icon: '📈', desc: 'Set monthly limits for team outings, fun, and more. Get notified before you overspend.' }
  ];
  constructor(private router:Router){}
  onLogin(){
    this.router.navigate(['/login']);
    console.log("click the loginning")
  }
}
