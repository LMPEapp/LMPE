import { TestBed } from '@angular/core/testing';

import { MessageReactionAccessApi } from './message-reaction-access-api';

describe('MessageReactionAccessApi', () => {
  let service: MessageReactionAccessApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageReactionAccessApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
