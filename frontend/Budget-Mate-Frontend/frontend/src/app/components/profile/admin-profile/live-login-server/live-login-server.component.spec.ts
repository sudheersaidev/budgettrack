import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveLoginServerComponent } from './live-login-server.component';

describe('LiveLoginServerComponent', () => {
  let component: LiveLoginServerComponent;
  let fixture: ComponentFixture<LiveLoginServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveLoginServerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveLoginServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
