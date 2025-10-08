import { TestBed } from '@angular/core/testing';

import { HomeSignalRService } from './home-signal-rservice';

describe('HomeSignalRService', () => {
  let service: HomeSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
