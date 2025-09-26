import { MyLocalDatePipe } from './my-local-date-pipe';

describe('MyLocalDatePipe', () => {
  it('create an instance', () => {
    const pipe = new MyLocalDatePipe();
    expect(pipe).toBeTruthy();
  });
});
