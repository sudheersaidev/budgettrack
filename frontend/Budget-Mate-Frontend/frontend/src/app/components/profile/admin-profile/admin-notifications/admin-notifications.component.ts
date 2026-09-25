import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
import { NotificationsService,AdminNotification } from '../../../../service/notifications.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css'
})
export class AdminNotificationsComponent implements OnInit {
  notifications: AdminNotification[] = [];

  constructor(private notificationService: NotificationsService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
    });
  }

  clearNotifications() {
    Swal.fire({
      title: 'Clear all notifications?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.clearAll();
        Swal.fire('Cleared!', 'Notification inbox is empty.', 'success');
      }
    });
  }

  getIcon(type: string) {
    return type === 'user' ? 'bi-person-badge' : 'bi-tags';
  }
}