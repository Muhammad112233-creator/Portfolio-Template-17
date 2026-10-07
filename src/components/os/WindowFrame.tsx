import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOS, type WindowInstance } from '../../store/os';
import { AppIcon, StatusGlyphs } from '../../lib/icons';
import { useDrag, useResize } from '../../hooks/useShell';
import { AppView } from '../apps/AppView';

const { minimize: MinIcon, maximize: MaxIcon, close: CloseIcon, spinner: Spinner } = StatusGlyphs;

function WindowFrameInner({ win, active }: { win: WindowInstance; active: boolean }) {
  const focusWindow = useOS((s) => s.focusWindow);
  const closeWindow = useOS((s) => s.closeWindow);
  const minimizeWindow = useOS((s) => s.minimizeWindow);
  const toggleMaximize = useOS((s) => s.toggleMaximize);
  const moveWindow = useOS((s) => s.moveWindow);
  const resizeWindow = useOS((s) => s.resizeWindow);

  const drag = useDrag((dx, dy) => {
    if (win.maximized) return;
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 90;
    moveWindow(win.id, clamp(win.rect.x + dx, -win.rect.w + 140, maxX), clamp(win.rect.y + dy, 0, maxY));
  });

  const handles = useResize(win.rect, (r) => !win.maximized && resizeWindow(win.id, r));

  const style = useMemo(
    () => ({
      left: win.rect.x,
      top: win.rect.y,
      width: win.rect.w,
      height: win.rect.h,
      zIndex: win.z,
    }),
    [win.rect, win.z]
  );

  return (
    <motion.section
      role="dialog"
      aria-label={win.title}
      aria-hidden={win.minimized}
      className={`win ${active ? '' : 'win--inactive'}`}
      style={style}
      initial={{ opacity: 0, scale: 0.9, y: 26 }}
      animate={{
        opacity: win.minimized ? 0 : 1,
        scale: win.minimized ? 0.9 : 1,
        y: win.minimized ? 40 : 0,
        pointerEvents: win.minimized ? 'none' : 'auto',
      }}
      exit={{ opacity: 0, scale: 0.92, y: 18, transition: { duration: 0.16, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.7 }}
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* title bar */}
      <header className="win__titlebar" {...drag} onDoubleClick={() => toggleMaximize(win.id)}>
        <AppIcon id={win.appId} size={17} radius={5} />
        <span className="win__title flex-1">{win.title}</span>

        {win.loading && <Spinner size={13} className="animate-spin opacity-60 mr-1" />}

        <div className="flex items-center" data-no-drag>
          <button className="wc" title="Minimize" aria-label="Minimize" onClick={() => minimizeWindow(win.id)}>
            <MinIcon size={15} strokeWidth={1.5} />
          </button>
          <button
            className="wc"
            title={win.maximized ? 'Restore' : 'Maximize'}
            aria-label={win.maximized ? 'Restore' : 'Maximize'}
            onClick={() => toggleMaximize(win.id)}
          >
            <MaxIcon size={12} strokeWidth={1.6} />
          </button>
          <button
            className="wc wc--close"
            title="Close"
            aria-label="Close"
            onClick={() => closeWindow(win.id)}
          >
            <CloseIcon size={15} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* body */}
      <div className="win__body" data-window-body>
        {win.loading ? (
          <div className="h-full grid place-items-center gap-3 text-center" style={{ color: 'var(--os-text-muted)' }}>
            <div className="flex flex-col items-center gap-3">
              <Spinner size={22} className="animate-spin" />
              <span className="text-xs">Loading {win.title}…</span>
            </div>
          </div>
        ) : (
          <AppView appId={win.appId} payload={win.payload} windowId={win.id} />
        )}
      </div>

      {/* resize handles */}
      {!win.maximized && (
        <>
          <div className="rz rz-n" {...handles.n} />
          <div className="rz rz-s" {...handles.s} />
          <div className="rz rz-e" {...handles.e} />
          <div className="rz rz-w" {...handles.w} />
          <div className="rz rz-ne" {...handles.ne} />
          <div className="rz rz-nw" {...handles.nw} />
          <div className="rz rz-se" {...handles.se} />
          <div className="rz rz-sw" {...handles.sw} />
        </>
      )}
    </motion.section>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export const WindowFrame = memo(WindowFrameInner);
