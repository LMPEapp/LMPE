import { TestBed } from '@angular/core/testing';

import { MessageAccessApi } from './message-access-api';

describe('MessageAccessApi', () => {
  let service: MessageAccessApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageAccessApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
