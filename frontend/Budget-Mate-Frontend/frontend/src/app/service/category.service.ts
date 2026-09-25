import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { tap } from 'rxjs/operators';

export interface Category {
  id?: number;
  name: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = 'https://localhost:7264/api/Categories'; // Match your backend port
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private notificationService: NotificationsService
  ) {
    this.refreshCategories();
  }

  // Fetch all categories from SQL via .NET API
  refreshCategories() {
    this.http.get<Category[]>(this.apiUrl).subscribe({
      next: (data) => this.categoriesSubject.next(data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  addCategory(name: string) {
    const newCat: Category = { name, enabled: true };
    this.http.post<Category>(this.apiUrl, newCat).subscribe({
      next: (savedCat) => {
        this.refreshCategories();
        this.notificationService.addNotification(`New category added: ${name}`, 'category');
      },
      error: (err) => console.error('Error adding category', err)
    });
  }

  deleteCategory(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.refreshCategories();
        this.notificationService.addNotification(`Category removed`, 'category');
      },
      error: (err) => console.error('Error deleting category', err)
    });
  }

  toggleCategory(category: Category) {
    const updated = { ...category, enabled: !category.enabled };
    this.http.put(`${this.apiUrl}/${category.id}`, updated).subscribe({
      next: () => {
        this.refreshCategories();
      },
      error: (err) => console.error('Error updating category', err)
    });
  }
}