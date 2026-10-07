import { useCallback, useEffect, useRef } from 'react';

/** Pointer-driven drag for window title bars. */
export function useDrag(
  onMove: (dx: number, dy: number) => void,
  onEnd?: () => void
) {
  const start = useRef({ x: 0, y: 0 });
  const active = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-drag]')) return;
      active.current = true;
      start.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current = { x: e.clientX, y: e.clientY };
      onMove(dx, dy);
    },
    [onMove]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return;
      active.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      onEnd?.();
    },
    [onEnd]
  );

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}

/** Edge/corner resize for windows. */
export function useResize(
  rect: { x: number; y: number; w: number; h: number },
  onResize: (r: { x: number; y: number; w: number; h: number }) => void
) {
  const start = useRef({ x: 0, y: 0, rect });
  const dir = useRef('');
  const active = useRef(false);

  const makeHandler = (d: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      active.current = true;
      dir.current = d;
      start.current = { x: e.clientX, y: e.clientY, rect: { ...rect } };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!active.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      const r = { ...start.current.rect };
      const minW = 340;
      const minH = 220;

      if (dir.current.includes('e')) r.w = Math.max(minW, start.current.rect.w + dx);
      if (dir.current.includes('s')) r.h = Math.max(minH, start.current.rect.h + dy);
      if (dir.current.includes('w')) {
        const w = Math.max(minW, start.current.rect.w - dx);
        r.x = start.current.rect.x + (start.current.rect.w - w);
        r.w = w;
      }
      if (dir.current.includes('n')) {
        const h = Math.max(minH, start.current.rect.h - dy);
        r.y = start.current.rect.y + (start.current.rect.h - h);
        r.h = h;
      }
      onResize(r);
    },
    onPointerUp: (e: React.PointerEvent) => {
      active.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    },
  });

  return { n: makeHandler('n'), s: makeHandler('s'), e: makeHandler('e'), w: makeHandler('w'), ne: makeHandler('ne'), nw: makeHandler('nw'), se: makeHandler('se'), sw: makeHandler('sw') };
}

/** Fires a callback on an interval, safely. */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

/** Closes a flyout when the user clicks outside of it. */
export function useClickOutside<T extends HTMLElement>(onOutside: () => void, active = true) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    // defer so the click that opened the flyout does not immediately close it
    const t = window.setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onOutside, active]);
  return ref;
}

/** Media query hook. */
export function useMediaQuery(query: string) {
  const ref = useRef(false);
  const [, force] = useReducerTick();
  useEffect(() => {
    const mq = window.matchMedia(query);
    ref.current = mq.matches;
    force();
    const handler = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
      force();
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query, force]);
  return ref.current;
}

import { useReducer } from 'react';
function useReducerTick(): [number, () => void] {
  const [n, bump] = useReducer((x: number) => x + 1, 0);
  return [n, bump];
}
