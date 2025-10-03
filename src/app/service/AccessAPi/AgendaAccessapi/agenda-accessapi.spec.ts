import { TestBed } from '@angular/core/testing';

import { AgendaAccessapi } from './agenda-accessapi';

describe('AgendaAccessapi', () => {
  let service: AgendaAccessapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgendaAccessapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
