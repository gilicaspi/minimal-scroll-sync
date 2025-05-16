import { scrollSyncEmitter, QUALIFIED_NAME } from './scrollSync';

describe('scrollSyncEmitter', () => {
  // simple polyfill so spyOn works under jsdom/Node
  beforeAll(() => {
    (global as any).requestAnimationFrame ??= (cb: FrameRequestCallback) => { cb(0); return 0; };
    (global as any).cancelAnimationFrame ??= () => {};
    // Patch crypto since it doesn't seem to exist in jest?
    (global as any).crypto.randomUUID ??= () => `${new Date().getTime() * Math.random()}`;
  });

  afterEach(() => {
    scrollSyncEmitter.resetCurrentElement();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('does not broadcast back to the source element', () => {
    const source = document.createElement('div');
    (source as any).scrollLeft = 42;

    const spy = jest.fn();
    scrollSyncEmitter.subscribeScroll(source, spy);

    scrollSyncEmitter.publish(source);

    expect(spy).not.toHaveBeenCalled();
  });

  it('broadcasts scrollLeft to all subscribers except the source', () => {
    const source   = { id: 'one', scrollLeft: 77 } as unknown as HTMLElement;
    const follower = { id: 'two', scrollLeft: 0  } as unknown as HTMLElement;

    scrollSyncEmitter.subscribeScroll(follower, off => { follower.scrollLeft = off; });

    jest.spyOn(global, 'requestAnimationFrame' as any).mockImplementation((cb: any) => { cb(0); return 0; });

    scrollSyncEmitter.publish(source);

    expect(follower.scrollLeft).toBe(77);
  });

  it('Does not broadcast scrollLeft to the source', () => {
    const source   = { id: 'one', scrollLeft: 77 } as unknown as HTMLElement;

    const setScrollLeft = jest.fn();

    scrollSyncEmitter.subscribeScroll(source, setScrollLeft);

    jest.spyOn(global, 'requestAnimationFrame' as any).mockImplementation((cb: any) => { cb(0); return 0; });

    scrollSyncEmitter.publish(source);

    expect(setScrollLeft).not.toHaveBeenCalled();
  });

  it('invokes scrollEnd only on the scroller', () => {
    const A = document.createElement('div');
    const B = document.createElement('div');

    const endA = jest.fn();
    const endB = jest.fn();

    scrollSyncEmitter.subscribeScrollEnd(A, endA);
    scrollSyncEmitter.subscribeScrollEnd(B, endB);

    jest.useFakeTimers();
    scrollSyncEmitter.publishScrollEnd(A);
    jest.runAllTimers(); // run SCROLL_END_DELAY timeout

    expect(endA).toHaveBeenCalledTimes(1);
    expect(endB).not.toHaveBeenCalled();
  });

  it('auto‑assigns a data attribute when the element has no id', () => {
    const el = document.createElement('div');

    // No id set – subscribe should patch one in
    scrollSyncEmitter.subscribeScroll(el, () => {});

    const attr = el.getAttribute(QUALIFIED_NAME);
    expect(attr).toBeTruthy();
  });

  it('broadcasts scrollLeft to subscribers (auto‑patched ids)', () => {
    const source = document.createElement('div');
    const follower = document.createElement('div');

    // jsdom lets us set this property directly
    (source as any).scrollLeft = 77;
    (follower as any).scrollLeft = 0;

    scrollSyncEmitter.subscribeScroll(follower, offset => {
      (follower as any).scrollLeft = offset;
    });

    jest.spyOn(global, 'requestAnimationFrame' as any).mockImplementation((cb: any) => { cb(0); return 0; });

    scrollSyncEmitter.publish(source);

    expect((follower as any).scrollLeft).toBe(77);
  });
});
