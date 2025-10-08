import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvenanceDesProduitsPage } from './provenance-des-produits-page';

describe('ProvenanceDesProduitsPage', () => {
  let component: ProvenanceDesProduitsPage;
  let fixture: ComponentFixture<ProvenanceDesProduitsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvenanceDesProduitsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvenanceDesProduitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
