import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDialog } from './validation-dialog';

describe('ValidationDialog', () => {
  let component: ValidationDialog;
  let fixture: ComponentFixture<ValidationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
