import { TestBed } from '@angular/core/testing';

import { AgendaSignalRService } from './agenda-signal-rservice';

describe('AgendaSignalRService', () => {
  let service: AgendaSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgendaSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
