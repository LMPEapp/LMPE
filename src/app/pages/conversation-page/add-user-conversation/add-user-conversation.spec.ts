import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserConversation } from './add-user-conversation';

describe('AddUserConversation', () => {
  let component: AddUserConversation;
  let fixture: ComponentFixture<AddUserConversation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserConversation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserConversation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
