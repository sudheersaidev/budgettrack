import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerNotificationsComponent } from './manager-notifications.component';

describe('ManagerNotificationsComponent', () => {
  let component: ManagerNotificationsComponent;
  let fixture: ComponentFixture<ManagerNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
