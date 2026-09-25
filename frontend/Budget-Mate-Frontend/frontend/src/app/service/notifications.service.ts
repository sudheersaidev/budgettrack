import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AdminNotification {
  id: number;
  message: string;
  type: 'user' | 'category';
  timestamp: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<AdminNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadNotifications();
  }

  private loadNotifications() {
    if (this.isBrowser) {
      const saved = localStorage.getItem('admin_notifications');
      if (saved) {
        this.notificationsSubject.next(JSON.parse(saved));
      }
    }
  }

  addNotification(message: string, type: 'user' | 'category') {
    const current = this.notificationsSubject.getValue();
    const newNotif: AdminNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    const updated = [newNotif, ...current];
    this.notificationsSubject.next(updated);
    if (this.isBrowser) {
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
    }
  }

  clearAll() {
    this.notificationsSubject.next([]);
    if (this.isBrowser) localStorage.removeItem('admin_notifications');
  }
}