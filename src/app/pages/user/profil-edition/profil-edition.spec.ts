import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilEdition } from './profil-edition';

describe('ProfilEdition', () => {
  let component: ProfilEdition;
  let fixture: ComponentFixture<ProfilEdition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilEdition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilEdition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
