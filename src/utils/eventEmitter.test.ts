import { eventEmitter } from './eventEmitter';

const SAMPLE_KEY = 'sample-key';

afterEach(() => eventEmitter.clear());

it('adds callbacks to the list', () => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();

  eventEmitter.on(SAMPLE_KEY, callback1);
  eventEmitter.on(SAMPLE_KEY, callback2);
  eventEmitter.on(SAMPLE_KEY, callback2);

  expect(callback1).toHaveBeenCalledTimes(0);
  expect(callback2).toHaveBeenCalledTimes(0);

  eventEmitter.emit(SAMPLE_KEY);

  expect(callback1).toHaveBeenCalledTimes(1);
  expect(callback2).toHaveBeenCalledTimes(2);
});

it('removes callbacks from the list', () => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();

  eventEmitter.on(SAMPLE_KEY, callback1);
  eventEmitter.on(SAMPLE_KEY, callback2);
  eventEmitter.on(SAMPLE_KEY, callback2);

  eventEmitter.off(SAMPLE_KEY, callback1);

  expect(callback1).toHaveBeenCalledTimes(0);
  expect(callback2).toHaveBeenCalledTimes(0);

  callback1.mockReset();
  callback2.mockReset();
  eventEmitter.emit(SAMPLE_KEY);

  expect(callback1).toHaveBeenCalledTimes(0);
  expect(callback2).toHaveBeenCalledTimes(2);

  eventEmitter.off(SAMPLE_KEY, callback2);

  callback1.mockReset();
  callback2.mockReset();
  eventEmitter.emit(SAMPLE_KEY);

  expect(callback1).toHaveBeenCalledTimes(0);
  expect(callback2).toHaveBeenCalledTimes(0);
});

it('clears all listeners at once', () => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();

  eventEmitter.on(SAMPLE_KEY, callback1);
  eventEmitter.on(SAMPLE_KEY, callback2);
  eventEmitter.on(SAMPLE_KEY, callback2);

  expect(callback1).toHaveBeenCalledTimes(0);
  expect(callback2).toHaveBeenCalledTimes(0);

  eventEmitter.clear();

  eventEmitter.emit(SAMPLE_KEY);

  expect(callback1).toHaveBeenCalledTimes(0);
  expect(callback2).toHaveBeenCalledTimes(0);
});

it('deletes the key from map after removing the last item', () => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();

  eventEmitter.on(SAMPLE_KEY, callback1);
  eventEmitter.on(SAMPLE_KEY, callback2);

  expect(eventEmitter.size()).toBe(1);

  eventEmitter.off(SAMPLE_KEY, callback1);

  expect(eventEmitter.size()).toBe(1);

  eventEmitter.off(SAMPLE_KEY, callback2);

  expect(eventEmitter.size()).toBe(0);
});
