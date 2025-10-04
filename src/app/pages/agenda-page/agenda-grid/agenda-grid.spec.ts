import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaGrid } from './agenda-grid';

describe('AgendaGrid', () => {
  let component: AgendaGrid;
  let fixture: ComponentFixture<AgendaGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
