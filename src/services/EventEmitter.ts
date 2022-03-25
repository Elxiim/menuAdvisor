import EventEmitter from 'eventemitter3';

type Events = 'REFRESH' | 'REFRESH_NAVIGATION_BAR';

const eventEmitter = new EventEmitter<Events>();

const Emitter = {
  on: (event: Events, fn: (...args: any[]) => void) =>
    eventEmitter.on(event, fn),
  once: (event: Events, fn: (...args: any[]) => void) =>
    eventEmitter.once(event, fn),
  off: (event: Events, fn: (...args: any[]) => void) =>
    eventEmitter.off(event, fn),
  emit: (event: Events, ...payload: any[]) =>
    eventEmitter.emit(event, ...payload),
  removeListener: (
    event: Events,
    fn: (...args: any[]) => void,
    context?: any,
    once?: boolean,
  ) => eventEmitter.removeListener(event, fn, context, once),
};

export default Emitter;
