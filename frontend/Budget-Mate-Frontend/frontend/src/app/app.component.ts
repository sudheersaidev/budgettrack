import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './service/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  //title = 'frontend';
  showNavbar=true;
  constructor(private router:Router){
    this.router.events.subscribe(event=>{
      if(event instanceof NavigationEnd){
        this.showNavbar=event.url==='/login' || event.url==='/register';
      }
    })
  }
}
