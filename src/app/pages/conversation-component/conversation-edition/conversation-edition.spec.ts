import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEdition } from './conversation-edition';

describe('ConversationEdition', () => {
  let component: ConversationEdition;
  let fixture: ComponentFixture<ConversationEdition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEdition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationEdition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
