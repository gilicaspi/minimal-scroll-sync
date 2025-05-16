import { useEffect } from 'react';

const SCROLL_END_DELAY_MILLIS = 25;
export const QUALIFIED_NAME = 'data-minimal-scroll-sync-id';

type ScrollCallback = (offset: number) => void;

const getMinimalScrollSyncElementId = (el: Element) => el.id || el.getAttribute(QUALIFIED_NAME);

const setMinimalScrollSyncElementId = (el: Element) => {
  const newId = crypto.randomUUID();
  el.setAttribute(QUALIFIED_NAME, newId);
  return newId;
};

export const scrollSyncEmitter = (() => {
  // Keep track of the currently scrolling element
  // This takes advantage of JS being single-threaded, so we can just assume that the interacted element will win
  // the race condition
  let currentElement: Element | null;

  // Track callbacks by element id
  const scrollSubs: { [identifier: string]: ScrollCallback } = {};
  const scrollEndSubs: { [identifier: string]: ScrollCallback } = {};

  let animationFrameId: number | undefined = undefined;

  return {
    resetCurrentElement() {
      currentElement = null;
    },
    // Store a callback for each element
    subscribeScroll(el: Element, cb: ScrollCallback) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);

      scrollSubs[id] = cb;
      return () => delete scrollSubs[id];
    },
    publish(el: Element) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);

      if (currentElement && el !== currentElement) return;

      if (!currentElement) currentElement = el;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      requestAnimationFrame(() => {
        for (const [id, cb] of Object.entries(scrollSubs)) {
          if (currentElement && id === getMinimalScrollSyncElementId(currentElement)) continue;

          if (currentElement?.scrollLeft) cb(currentElement.scrollLeft);
        }
      });
    },

    // Scroll end needs to be a different event, since the callback will be mounting and unmounting the effect as the
    // virtualized list scrolls
    subscribeScrollEnd(el: Element, cb: ScrollCallback) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);

      scrollEndSubs[id] = cb;
      return () => delete scrollEndSubs[id];
    },
    publishScrollEnd(el: Element) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);

      if (currentElement && el !== currentElement) return;

      if (!currentElement) currentElement = el;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      requestAnimationFrame(() => {
        // First just set the offsets
        for (const [id, cb] of Object.entries(scrollSubs)) {
          if (currentElement && id === getMinimalScrollSyncElementId(currentElement)) continue;

          if (currentElement?.scrollLeft) cb(currentElement.scrollLeft);
        }

        // Then only call the scrollEnd callback for the scrolling element
        for (const [id, cb] of Object.entries(scrollEndSubs)) {
          if (currentElement && id === getMinimalScrollSyncElementId(currentElement)) cb(currentElement.scrollLeft);
        }

        // Clear the current element, but wait a slight delay to let some of the dispatches to work through
        setTimeout(() => (currentElement = null), SCROLL_END_DELAY_MILLIS);
      });
    },
  };
})();

// NOTE: This hook is expected to be pretty stable - this is very important since we don't want too many extra
//       clock cycles cluttering up scroll events
export const useScrollSync = (ref: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const unsubscribe = scrollSyncEmitter.subscribeScroll(element, offset => (element.scrollLeft = offset));

    const handleScroll = () => scrollSyncEmitter.publish(element);
    const handleScrollEnd = () => scrollSyncEmitter.publishScrollEnd(element);

    element.addEventListener('scroll', handleScroll);
    element.addEventListener('scrollend', handleScrollEnd);

    return () => {
      // Unsubscribe from the emitter
      unsubscribe();

      // Remove listeners when the component unmounts
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [ref]);
};

// NOTE: Only for divs which follow but never lead the scroll event
export const useScrollSyncSubscribe = (ref: React.RefObject<HTMLElement | null>, scrollSpeed = 1) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const unsubscribe = scrollSyncEmitter.subscribeScroll(element, offset => (element.scrollLeft = offset * scrollSpeed));

    return () => {
      // Unsubscribe from the emitter
      unsubscribe();
    };
  }, [ref, scrollSpeed]);
};

// NOTE: This hook is expected to be much less stable than the useScrollSync hook, but that's more ok, since we won't
//       be adding and removing listeners _during_ the scroll event
export const useScrollEndSubscribe = (
  ref: React.RefObject<HTMLElement | null>,
  scrollEndCallback?: (offset: number) => void,
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const unsubscribe = scrollSyncEmitter.subscribeScrollEnd(element, offset => scrollEndCallback?.(offset));

    return () => {
      unsubscribe();
    };
  }, [ref, scrollEndCallback]);
};
