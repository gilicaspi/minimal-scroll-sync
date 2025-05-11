type ScrollCallback = (offset: number) => void;
declare const scrollSyncEmitter: {
    resetCurrentElement(): void;
    subscribeScroll(el: Element, cb: ScrollCallback): () => boolean;
    publish(el: Element): void;
    subscribeScrollEnd(el: Element, cb: ScrollCallback): () => boolean;
    publishScrollEnd(el: Element): void;
};
declare const useScrollSync: (ref: React.RefObject<HTMLElement | null>) => void;
declare const useScrollSyncSubscribe: (ref: React.RefObject<HTMLElement | null>, scrollSpeed?: number) => void;
declare const useScrollEndSubscribe: (ref: React.RefObject<HTMLElement | null>, scrollEndCallback?: (offset: number) => void) => void;

export { scrollSyncEmitter, useScrollEndSubscribe, useScrollSync, useScrollSyncSubscribe };
