import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenairesPage } from './partenaires-page';

describe('PartenairesPage', () => {
  let component: PartenairesPage;
  let fixture: ComponentFixture<PartenairesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartenairesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartenairesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
