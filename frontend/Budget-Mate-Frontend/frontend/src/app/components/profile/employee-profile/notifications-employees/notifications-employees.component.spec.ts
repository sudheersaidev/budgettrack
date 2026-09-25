import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsEmployeesComponent } from './notifications-employees.component';

describe('NotificationsEmployeesComponent', () => {
  let component: NotificationsEmployeesComponent;
  let fixture: ComponentFixture<NotificationsEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
