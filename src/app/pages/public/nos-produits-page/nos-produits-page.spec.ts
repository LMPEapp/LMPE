import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NosProduitsPage } from './nos-produits-page';

describe('NosProduitsPage', () => {
  let component: NosProduitsPage;
  let fixture: ComponentFixture<NosProduitsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NosProduitsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NosProduitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
