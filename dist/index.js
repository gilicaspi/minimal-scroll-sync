"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  QUALIFIED_NAME: () => QUALIFIED_NAME,
  scrollSyncEmitter: () => scrollSyncEmitter,
  useScrollEndSubscribe: () => useScrollEndSubscribe,
  useScrollSync: () => useScrollSync,
  useScrollSyncSubscribe: () => useScrollSyncSubscribe
});
module.exports = __toCommonJS(index_exports);

// src/scrollSync.ts
var import_react = require("react");
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
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
    const element = ref.current;
    if (!element) return;
    const unsubscribe = scrollSyncEmitter.subscribeScroll(element, (offset) => element.scrollLeft = offset * scrollSpeed);
    return () => {
      unsubscribe();
    };
  }, [ref, scrollSpeed]);
};
var useScrollEndSubscribe = (ref, scrollEndCallback) => {
  (0, import_react.useEffect)(() => {
    const element = ref.current;
    if (!element) return;
    const unsubscribe = scrollSyncEmitter.subscribeScrollEnd(element, (offset) => scrollEndCallback == null ? void 0 : scrollEndCallback(offset));
    return () => {
      unsubscribe();
    };
  }, [ref, scrollEndCallback]);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QUALIFIED_NAME,
  scrollSyncEmitter,
  useScrollEndSubscribe,
  useScrollSync,
  useScrollSyncSubscribe
});
