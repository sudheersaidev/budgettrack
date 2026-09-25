import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetManagerChangeComponent } from './budget-manager-change.component';

describe('BudgetManagerChangeComponent', () => {
  let component: BudgetManagerChangeComponent;
  let fixture: ComponentFixture<BudgetManagerChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetManagerChangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetManagerChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
