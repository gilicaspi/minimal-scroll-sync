// src/scrollSync.ts
import { useEffect } from "react";
var SCROLL_END_DELAY_MILLIS = 25;
var scrollSyncEmitter = /* @__PURE__ */ (() => {
  let currentElement;
  const scrollSubs = {};
  const scrollEndSubs = {};
  let animationFrameId = void 0;
  return {
    resetCurrentElement() {
      currentElement = null;
    },
    // Store a callback for each element
    subscribeScroll(el, cb) {
      scrollSubs[el.id] = cb;
      return () => delete scrollSubs[el.id];
    },
    publish(el) {
      if (currentElement && el !== currentElement) return;
      if (!currentElement) currentElement = el;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      requestAnimationFrame(() => {
        for (const [id, cb] of Object.entries(scrollSubs)) {
          if (currentElement && id === currentElement.id) continue;
          if (currentElement == null ? void 0 : currentElement.scrollLeft) cb(currentElement.scrollLeft);
        }
      });
    },
    // Scroll end needs to be a different event, since the callback will be mounting and unmounting the effect as the
    // virtualized list scrolls
    subscribeScrollEnd(el, cb) {
      scrollEndSubs[el.id] = cb;
      return () => delete scrollEndSubs[el.id];
    },
    publishScrollEnd(el) {
      if (currentElement && el !== currentElement) return;
      if (!currentElement) currentElement = el;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      requestAnimationFrame(() => {
        for (const [id, cb] of Object.entries(scrollSubs)) {
          if (currentElement && id === currentElement.id) continue;
          if (currentElement == null ? void 0 : currentElement.scrollLeft) cb(currentElement.scrollLeft);
        }
        for (const [id, cb] of Object.entries(scrollEndSubs)) {
          if (currentElement && id === currentElement.id) cb(currentElement.scrollLeft);
        }
        setTimeout(() => currentElement = null, SCROLL_END_DELAY_MILLIS);
      });
    }
  };
})();
var useScrollSync = (ref) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const unsubscribe = scrollSyncEmitter.subscribeScroll(element, (offset) => element.scrollLeft = offset);
    const handleScroll = () => scrollSyncEmitter.publish(element);
    const handleScrollEnd = () => scrollSyncEmitter.publishScrollEnd(element);
    element.addEventListener("scroll", handleScroll);
    element.addEventListener("scrollend", handleScrollEnd);
    return () => {
      unsubscribe();
      element.removeEventListener("scroll", handleScroll);
      element.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [ref]);
};
var useScrollSyncSubscribe = (ref, scrollSpeed = 1) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const unsubscribe = scrollSyncEmitter.subscribeScroll(element, (offset) => element.scrollLeft = offset * scrollSpeed);
    return () => {
      unsubscribe();
    };
  }, [ref, scrollSpeed]);
};
var useScrollEndSubscribe = (ref, scrollEndCallback) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const unsubscribe = scrollSyncEmitter.subscribeScrollEnd(element, (offset) => scrollEndCallback == null ? void 0 : scrollEndCallback(offset));
    return () => {
      unsubscribe();
    };
  }, [ref, scrollEndCallback]);
};
export {
  scrollSyncEmitter,
  useScrollEndSubscribe,
  useScrollSync,
  useScrollSyncSubscribe
};
