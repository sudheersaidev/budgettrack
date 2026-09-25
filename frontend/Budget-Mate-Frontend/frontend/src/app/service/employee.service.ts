import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http:HttpClient,private router:Router) { }
  moveExpenseScreenTime(){
    this.router.navigate(['/expenseList']);
  }
}
