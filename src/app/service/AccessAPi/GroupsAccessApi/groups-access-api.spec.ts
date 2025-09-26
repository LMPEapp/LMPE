import { TestBed } from '@angular/core/testing';

import { GroupsAccessApi } from './groups-access-api';

describe('GroupsAccessApi', () => {
  let service: GroupsAccessApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupsAccessApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
