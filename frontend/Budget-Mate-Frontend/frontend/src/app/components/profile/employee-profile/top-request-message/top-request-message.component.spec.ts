import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRequestMessageComponent } from './top-request-message.component';

describe('TopRequestMessageComponent', () => {
  let component: TopRequestMessageComponent;
  let fixture: ComponentFixture<TopRequestMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRequestMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopRequestMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
