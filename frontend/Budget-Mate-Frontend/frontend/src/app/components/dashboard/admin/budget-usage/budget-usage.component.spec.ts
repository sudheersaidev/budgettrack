import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetUsageComponent } from './budget-usage.component';

describe('BudgetUsageComponent', () => {
  let component: BudgetUsageComponent;
  let fixture: ComponentFixture<BudgetUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetUsageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
