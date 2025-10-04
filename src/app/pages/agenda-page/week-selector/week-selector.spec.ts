import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekSelector } from './week-selector';

describe('WeekSelector', () => {
  let component: WeekSelector;
  let fixture: ComponentFixture<WeekSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
