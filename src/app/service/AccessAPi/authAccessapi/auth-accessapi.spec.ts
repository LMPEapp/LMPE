import { TestBed } from '@angular/core/testing';

import { AuthAccessapi } from './auth-accessapi';

describe('AuthAccessapi', () => {
  let service: AuthAccessapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthAccessapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
