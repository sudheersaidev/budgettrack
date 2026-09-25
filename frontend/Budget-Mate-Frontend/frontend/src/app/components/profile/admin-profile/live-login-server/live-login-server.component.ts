import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../service/user.service';

@Component({
  selector: 'app-live-login-server',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-login-server.component.html',
  styleUrl: './live-login-server.component.css'
})
export class LiveLoginServerComponent implements OnInit {
  loginLogs: any[] = []; 
  selectedUser: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadLiveFeed();
  }

  // FIX: Added the missing method called by the HTML (click) event
  fetchLogins(): void {
    this.loadLiveFeed();
  }

  loadLiveFeed(): void {
    // FIX: Added explicit types to 'data' and 'err' to satisfy strict TypeScript rules
    this.userService.getRecentLogins().subscribe({
      next: (data: any[]) => {
        // Sort by loginTime: Most recent at the top
        this.loginLogs = data.sort((a: any, b: any) => 
          new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
        );
      },
      error: (err: any) => {
        console.error('Error fetching timeline', err);
      }
    });
  }

  showUserDetails(log: any): void {
    this.selectedUser = log;
  }
}