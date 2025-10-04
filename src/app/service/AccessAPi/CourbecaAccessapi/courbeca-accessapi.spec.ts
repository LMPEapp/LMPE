import { TestBed } from '@angular/core/testing';

import { CourbecaAccessapi } from './courbeca-accessapi';

describe('CourbecaAccessapi', () => {
  let service: CourbecaAccessapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourbecaAccessapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
