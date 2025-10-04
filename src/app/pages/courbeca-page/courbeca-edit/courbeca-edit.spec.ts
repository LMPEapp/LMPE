import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourbecaEdit } from './courbeca-edit';

describe('CourbecaEdit', () => {
  let component: CourbecaEdit;
  let fixture: ComponentFixture<CourbecaEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourbecaEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourbecaEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
