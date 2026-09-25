import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopUpRequestComponent } from './top-up-request.component';

describe('TopUpRequestComponent', () => {
  let component: TopUpRequestComponent;
  let fixture: ComponentFixture<TopUpRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopUpRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopUpRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
