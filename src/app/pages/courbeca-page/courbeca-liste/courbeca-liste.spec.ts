import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourbecaListe } from './courbeca-liste';

describe('CourbecaListe', () => {
  let component: CourbecaListe;
  let fixture: ComponentFixture<CourbecaListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourbecaListe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourbecaListe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
