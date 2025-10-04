import { TestBed } from '@angular/core/testing';

import { CourbecaSignalRService } from './courbeca-signal-rservice';

describe('CourbecaSignalRService', () => {
  let service: CourbecaSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourbecaSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
