import { useEffect, useState, type DependencyList } from 'react';

/**
 * Defer ResizeObserver work to the next animation frame so layout updates from the
 * callback do not trigger "ResizeObserver loop completed with undelivered notifications".
 */
export function scheduleDeferredResizeObserverWork(callback: () => void): void {
  requestAnimationFrame(callback);
}

/** Observe an element's content width; updates are deferred via requestAnimationFrame. */
export function useDeferredResizeObserverWidth(
  getElement: () => HTMLElement | null,
  deps: DependencyList = []
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = getElement();
    if (!element) {
      return undefined;
    }

    let rafId = 0;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setWidth(Math.max(0, Math.floor(element.clientWidth)));
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return width;
}

/** Observe an element's offset width; updates are deferred via requestAnimationFrame. */
export function useDeferredResizeObserverOffsetWidth(
  getElement: () => HTMLElement | null,
  deps: DependencyList = []
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = getElement();
    if (!element) {
      return undefined;
    }

    let rafId = 0;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setWidth(Math.max(0, Math.floor(element.offsetWidth)));
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return width;
}
