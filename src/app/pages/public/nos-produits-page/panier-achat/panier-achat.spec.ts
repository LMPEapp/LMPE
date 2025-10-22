import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierAchat } from './panier-achat';

describe('PanierAchat', () => {
  let component: PanierAchat;
  let fixture: ComponentFixture<PanierAchat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanierAchat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierAchat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
