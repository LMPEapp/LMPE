import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualitesPage } from './actualites-page';

describe('ActualitesPage', () => {
  let component: ActualitesPage;
  let fixture: ComponentFixture<ActualitesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualitesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualitesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
