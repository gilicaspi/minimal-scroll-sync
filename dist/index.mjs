// src/scrollSync.ts
import { useEffect } from "react";
var SCROLL_END_DELAY_MILLIS = 25;
var QUALIFIED_NAME = "data-minimal-scroll-sync-id";
var getMinimalScrollSyncElementId = (el) => el.id || el.getAttribute(QUALIFIED_NAME);
var setMinimalScrollSyncElementId = (el) => {
  const newId = crypto.randomUUID();
  el.setAttribute(QUALIFIED_NAME, newId);
  return newId;
};
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
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);
      scrollSubs[id] = cb;
      return () => delete scrollSubs[id];
    },
    publish(el) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);
      if (currentElement && el !== currentElement) return;
      if (!currentElement) currentElement = el;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      requestAnimationFrame(() => {
        for (const [id2, cb] of Object.entries(scrollSubs)) {
          if (currentElement && id2 === getMinimalScrollSyncElementId(currentElement)) continue;
          if (currentElement == null ? void 0 : currentElement.scrollLeft) cb(currentElement.scrollLeft);
        }
      });
    },
    // Scroll end needs to be a different event, since the callback will be mounting and unmounting the effect as the
    // virtualized list scrolls
    subscribeScrollEnd(el, cb) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);
      scrollEndSubs[id] = cb;
      return () => delete scrollEndSubs[id];
    },
    publishScrollEnd(el) {
      let id = getMinimalScrollSyncElementId(el);
      if (!id) id = setMinimalScrollSyncElementId(el);
      if (currentElement && el !== currentElement) return;
      if (!currentElement) currentElement = el;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      requestAnimationFrame(() => {
        for (const [id2, cb] of Object.entries(scrollSubs)) {
          if (currentElement && id2 === getMinimalScrollSyncElementId(currentElement)) continue;
          if (currentElement == null ? void 0 : currentElement.scrollLeft) cb(currentElement.scrollLeft);
        }
        for (const [id2, cb] of Object.entries(scrollEndSubs)) {
          if (currentElement && id2 === getMinimalScrollSyncElementId(currentElement)) cb(currentElement.scrollLeft);
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
  QUALIFIED_NAME,
  scrollSyncEmitter,
  useScrollEndSubscribe,
  useScrollSync,
  useScrollSyncSubscribe
};
