import { TestBed } from '@angular/core/testing';

import { UserAccessapi } from './user-accessapi';

describe('UserAccessapi', () => {
  let service: UserAccessapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAccessapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
