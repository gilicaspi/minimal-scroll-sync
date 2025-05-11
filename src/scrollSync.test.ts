import { scrollSyncEmitter } from './scrollSync';

describe('scrollSyncEmitter', () => {
  // simple polyfill so spyOn works under jsdom/Node
  beforeAll(() => {
    (global as any).requestAnimationFrame ??= (cb: FrameRequestCallback) => { cb(0); return 0; };
    (global as any).cancelAnimationFrame ??= () => {};
  });

  afterEach(() => {
    scrollSyncEmitter.resetCurrentElement();
    jest.restoreAllMocks();
    jest.useRealTimers();
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
    const follower = { id: 'two', scrollLeft: 0  } as unknown as HTMLElement;

    const setScrollLeft = jest.fn();

    scrollSyncEmitter.subscribeScroll(source, setScrollLeft);

    jest.spyOn(global, 'requestAnimationFrame' as any).mockImplementation((cb: any) => { cb(0); return 0; });

    scrollSyncEmitter.publish(source);

    expect(setScrollLeft).not.toHaveBeenCalled();
  });

  it('invokes scrollEnd only for the scroller', () => {
    const A = { id: 'A', scrollLeft: 10 } as unknown as HTMLElement;
    const B = { id: 'B', scrollLeft: 10 } as unknown as HTMLElement;

    const endA = jest.fn();
    const endB = jest.fn();

    scrollSyncEmitter.subscribeScrollEnd(A, endA);
    scrollSyncEmitter.subscribeScrollEnd(B, endB);

    jest.spyOn(global, 'requestAnimationFrame' as any).mockImplementation((cb: any) => { cb(0); return 0; });
    jest.useFakeTimers();

    scrollSyncEmitter.publishScrollEnd(A);
    jest.runAllTimers();          // run SCROLL_END_DELAY timeout

    expect(endA).toHaveBeenCalledTimes(1);
    expect(endB).not.toHaveBeenCalled();
  });
});
