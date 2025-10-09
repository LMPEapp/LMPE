import { TestBed } from '@angular/core/testing';

import { PushAccessapi } from './push-accessapi';

describe('PushAccessapi', () => {
  let service: PushAccessapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PushAccessapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
