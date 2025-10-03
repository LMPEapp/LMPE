import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaEdition } from './agenda-edition';

describe('AgendaEdition', () => {
  let component: AgendaEdition;
  let fixture: ComponentFixture<AgendaEdition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaEdition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaEdition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
