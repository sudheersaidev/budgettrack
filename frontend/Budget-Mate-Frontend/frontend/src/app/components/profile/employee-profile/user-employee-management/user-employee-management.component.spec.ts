import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEmployeeManagementComponent } from './user-employee-management.component';

describe('UserEmployeeManagementComponent', () => {
  let component: UserEmployeeManagementComponent;
  let fixture: ComponentFixture<UserEmployeeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEmployeeManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEmployeeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
