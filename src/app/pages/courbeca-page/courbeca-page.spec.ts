import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourbecaPage } from './courbeca-page';

describe('CourbecaPage', () => {
  let component: CourbecaPage;
  let fixture: ComponentFixture<CourbecaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourbecaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourbecaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
