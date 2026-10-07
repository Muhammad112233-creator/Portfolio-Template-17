import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS, WALLPAPERS, type AppId } from '../../store/os';
import { StatusGlyphs, AppIcon } from '../../lib/icons';
import { profile } from '../../data/profile';
import { gallery } from '../../data/projects';
import { useClickOutside } from '../../hooks/useShell';
import { searchIndex, type SearchHit } from '../../lib/search';
import { Img } from '../ui/Img';

const {
  wifi: WifiIcon,
  wifiOff: WifiOffIcon,
  bluetooth: BtIcon,
  airplane: PlaneIcon,
  moon: MoonIcon,
  volume: VolIcon,
  mute: MuteIcon,
  bell: BellIcon,
  trash: TrashIcon,
  chevronRight: Chevron,
  sun: SunIcon,
  clock: ClockIcon,
} = StatusGlyphs;

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

export function SearchPanel() {
  const open = useOS((s) => s.searchOpen);
  const setOpen = useOS((s) => s.toggleSearch);
  const openApp = useOS((s) => s.openApp);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  const pick = (hit: SearchHit) => {
    openApp(hit.appId, hit.payload, hit.title);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1250] flex justify-center pt-[11vh]"
          style={{ background: 'rgba(4,6,12,.34)', backdropFilter: 'blur(3px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onPointerDown={() => setOpen(false)}
        >
          <motion.div
            ref={ref}
            className="search-panel h-fit"
            initial={{ y: -24, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, transition: { duration: 0.13 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 33 }}
            onPointerDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Search"
          >
            <SearchBody onPick={pick} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchBody({ onPick }: { onPick: (hit: SearchHit) => void }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const results = useMemo(() => searchIndex(q), [q]);
  const active = Math.min(idx, Math.max(0, results.length - 1));

  useEffect(() => {
    document.getElementById(`sr-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const submit = () => {
    const hit = results[active];
    if (hit) onPick(hit);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-4 h-14" style={{ borderBottom: '1px solid var(--os-border)' }}>
        <StatusGlyphs.search size={18} style={{ color: 'var(--os-text-muted)' }} />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIdx(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIdx((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIdx((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter') {
              submit();
            } else if (e.key === 'Escape') {
              useOS.getState().toggleSearch(false);
            }
          }}
          placeholder="Search apps, projects, writing and pages"
          className="flex-1 bg-transparent outline-none text-sm"
          aria-label="Search query"
        />
        {q && (
          <button className="text-[11.5px]" style={{ color: 'var(--os-text-muted)' }} onClick={() => setQ('')}>
            Clear
          </button>
        )}
      </div>

      <div className="overflow-y-auto p-2 max-h-[62vh]">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
          {q ? `Results for “${q}”` : 'Suggested'}
        </p>
        {results.length === 0 && (
          <p className="px-3 py-8 text-sm text-center" style={{ color: 'var(--os-text-muted)' }}>
            Nothing matched. Try “resume”, “gallery”, “terminal” or “contact”.
          </p>
        )}
        {results.map((r, i) => (
          <button
            key={r.key}
            id={`sr-${i}`}
            className={`search-row ${i === active ? 'search-row--active' : ''}`}
            onMouseEnter={() => setIdx(i)}
            onClick={() => onPick(r)}
          >
            {r.kind === 'app' ? (
              <AppIcon id={r.appId} size={30} radius={8} />
            ) : (
              <span
                className="grid place-items-center rounded-md text-[10.5px] font-semibold text-white shrink-0"
                style={{ width: 30, height: 30, background: r.color ?? 'var(--os-accent)' }}
              >
                {r.kind === 'project' ? 'PR' : r.kind === 'post' ? 'WR' : r.kind === 'photo' ? 'PH' : 'PG'}
              </span>
            )}
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium truncate">{r.title}</span>
              <span className="block text-[11.5px] truncate" style={{ color: 'var(--os-text-muted)' }}>
                {r.sub}
              </span>
            </span>
            {i === active && (
              <span
                className="text-[10.5px] px-1.5 py-0.5 rounded shrink-0"
                style={{ background: 'color-mix(in srgb, var(--os-text) 10%, transparent)', color: 'var(--os-text-muted)' }}
              >
                Enter
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Quick settings flyout (also shows notifications, like the real tray)
 * ------------------------------------------------------------------ */

export function QuickPanel() {
  const open = useOS((s) => s.trayOpen || s.quickOpen);
  const close = () => useOS.setState({ trayOpen: false, quickOpen: false });
  const ref = useClickOutside<HTMLDivElement>(close, open);

  const s = useOS();
  const toasts = useOS((st) => st.toasts);
  const clearToasts = useOS((st) => st.clearToasts);

  const tiles = [
    {
      id: 'wifi', on: s.wifi, label: s.wifi ? 'Wifi' : 'Wifi off',
      sub: s.wifi ? 'Studio-Meridian' : 'Disconnected',
      icon: s.wifi ? WifiIcon : WifiOffIcon,
      toggle: () => s.patchQuick({ wifi: !s.wifi, airplane: false }),
    },
    {
      id: 'bt', on: s.bluetooth, label: 'Bluetooth',
      sub: s.bluetooth ? 'Connected' : 'Off', icon: BtIcon,
      toggle: () => s.patchQuick({ bluetooth: !s.bluetooth }),
    },
    {
      id: 'air', on: s.airplane, label: 'Airplane',
      sub: s.airplane ? 'On' : 'Off', icon: PlaneIcon,
      toggle: () => s.patchQuick({ airplane: !s.airplane, wifi: false, bluetooth: false }),
    },
    {
      id: 'night', on: s.nightLight, label: 'Night light',
      sub: s.nightLight ? 'Warmer' : 'Off', icon: MoonIcon,
      toggle: () => s.patchQuick({ nightLight: !s.nightLight }),
    },
    {
      id: 'focus', on: s.focusMode, label: 'Focus',
      sub: s.focusMode ? 'On' : 'Off', icon: ClockIcon,
      toggle: () => s.toggleFocus(),
    },
    {
      id: 'mute', on: s.muted, label: s.muted ? 'Muted' : 'Sound',
      sub: `${s.volume}%`, icon: s.muted ? MuteIcon : VolIcon,
      toggle: () => s.patchQuick({ muted: !s.muted }),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="flyout bottom-[56px] right-3"
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.99, transition: { duration: 0.13 } }}
          transition={{ type: 'spring', stiffness: 430, damping: 34 }}
          role="dialog"
          aria-label="Quick settings"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <button
                key={t.id}
                className={`qs-tile ${t.on ? 'qs-tile--on' : ''}`}
                onClick={t.toggle}
                title={`${t.label} — ${t.sub}`}
              >
                <span className="flex flex-col items-start gap-1 min-w-0 text-left w-full">
                  <t.icon size={16} strokeWidth={1.8} />
                  <span className="block text-[11.5px] font-medium leading-tight truncate w-full">{t.label}</span>
                  <span className="block text-[10px] opacity-75 leading-tight truncate w-full">{t.sub}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3.5 space-y-3">
            <label className="block">
              <span className="flex items-center justify-between text-[11.5px] mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <SunIcon size={13} /> Brightness
                </span>
                <span className="tabular-nums">{s.brightness}%</span>
              </span>
              <input
                type="range"
                min={35}
                max={100}
                value={s.brightness}
                onChange={(e) => s.setBrightness(Number(e.target.value))}
                className="slider"
                style={{ ['--pct' as string]: `${((s.brightness - 35) / 65) * 100}%` }}
                aria-label="Brightness"
              />
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-[11.5px] mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <VolIcon size={13} /> Volume
                </span>
                <span className="tabular-nums">{s.muted ? 'Muted' : `${s.volume}%`}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={s.muted ? 0 : s.volume}
                onChange={(e) => s.setVolume(Number(e.target.value))}
                className="slider"
                style={{ ['--pct' as string]: `${s.muted ? 0 : s.volume}%` }}
                aria-label="Volume"
              />
            </label>
          </div>

          <div
            className="mt-3.5 pt-3 flex items-center justify-between text-[11px]"
            style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}
          >
            <span className="flex items-center gap-1.5">
              {s.airplane ? <PlaneIcon size={13} /> : s.wifi ? <WifiIcon size={13} /> : <WifiOffIcon size={13} />}
              {s.airplane ? 'Airplane mode' : s.wifi ? 'Studio-Meridian · secured' : 'No connection'}
            </span>
            <span className="tabular-nums">
              {Math.round(s.battery)}%{s.charging ? ' · charging' : ''}
            </span>
          </div>

          <div className="mt-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold flex items-center gap-1.5">
                <BellIcon size={13} /> Notifications
              </span>
              {toasts.length > 0 && (
                <button className="text-[11px] flex items-center gap-1" style={{ color: 'var(--os-text-muted)' }} onClick={clearToasts}>
                  <TrashIcon size={12} /> Clear all
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-[186px] overflow-y-auto pr-0.5">
              {toasts.length === 0 && (
                <p className="text-[11.5px] py-4 text-center" style={{ color: 'var(--os-text-muted)' }}>
                  No new notifications
                </p>
              )}
              {toasts.map((t) => (
                <div key={t.id} className="flex gap-2.5 p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--os-text) 6%, transparent)' }}>
                  <AppIcon id={t.appId} size={26} radius={7} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium truncate">{t.title}</span>
                    <span className="block text-[11px] leading-snug line-clamp-2" style={{ color: 'var(--os-text-muted)' }}>
                      {t.body}
                    </span>
                    <span className="block text-[10px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                      {new Date(t.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="mt-3.5 w-full h-9 rounded-lg text-[12.5px] font-medium flex items-center justify-center gap-2"
            style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)' }}
            onClick={() => {
              close();
              useOS.getState().openApp('settings', undefined, 'Settings');
            }}
          >
            <StatusGlyphs.settings size={14} /> All settings
            <Chevron size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 * Task view
 * ------------------------------------------------------------------ */

const APP_BLURB: Partial<Record<AppId, string>> = {
  browser: 'Portfolio pages with the written record.',
  works: 'Case studies, filters and detail views.',
  terminal: 'Shell session waiting for input.',
  gallery: 'Photo grid and lightbox.',
  settings: 'Appearance, wallpaper, system.',
  resume: 'Experience, skills, education.',
  explorer: 'D:/Projects — folders and files.',
  studio: 'Generative ambient synthesizer.',
  wall: 'A public corkboard of visitor notes.',
  snake: 'Grid game, arrow keys.',
  calculator: 'Arithmetic with a running tape.',
  contact: 'Write a message.',
  store: 'Browse and install extra apps.',
  notes: 'Scratch notes that persist.',
  notepad: 'One small sticky note.',
  welcome: 'Guided tour of this desktop.',
};

export function TaskView() {
  const open = useOS((s) => s.taskViewOpen);
  const closeTaskView = () => useOS.setState({ taskViewOpen: false });
  const windows = useOS((s) => s.windows);
  const focusWindow = useOS((s) => s.focusWindow);
  const restoreApp = useOS((s) => s.restoreApp);
  const closeApp = useOS((s) => s.closeApp);
  const openApp = useOS((s) => s.openApp);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1240] flex flex-col"
          style={{
            background: 'color-mix(in srgb, var(--os-lighter) 88%, transparent)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex-1 overflow-y-auto px-7 pt-10 pb-4">
            <h2 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--os-text-muted)' }}>
              Open windows
            </h2>
            {windows.length === 0 ? (
              <div className="grid place-items-center py-24 text-center">
                <p className="text-sm" style={{ color: 'var(--os-text-muted)' }}>
                  Nothing is open. Launch something:
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {(['works', 'browser', 'gallery', 'terminal'] as AppId[]).map((id) => (
                    <button
                      key={id}
                      className="chip"
                      onClick={() => {
                        closeTaskView();
                        openApp(id, undefined, undefined);
                      }}
                    >
                      <AppIcon id={id} size={18} radius={5} />
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...windows]
                  .sort((a, b) => b.z - a.z)
                  .map((w, i) => (
                    <motion.div
                      key={w.id}
                      className="taskview-card"
                      initial={{ opacity: 0, y: 22, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 380, damping: 30 }}
                    >
                      <div className="relative">
                        <button
                          className="w-full text-left"
                          onClick={() => {
                            closeTaskView();
                            if (w.minimized) restoreApp(w.appId);
                            else focusWindow(w.id);
                          }}
                        >
                          <span className="block h-[126px] px-3 pt-3 overflow-hidden" style={{ background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}>
                            <span className="block text-[10.5px] font-medium mb-1.5 truncate" style={{ color: 'var(--os-text-muted)' }}>
                              {w.title}
                            </span>
                            <span className="block text-[10.5px] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                              {APP_BLURB[w.appId] ?? 'Application window.'}
                            </span>
                          </span>
                          <span className="flex items-center gap-2 px-3 py-2.5">
                            <AppIcon id={w.appId} size={20} radius={5} />
                            <span className="flex-1 min-w-0">
                              <span className="block text-[12px] font-medium truncate">{w.title}</span>
                              <span className="block text-[10.5px]" style={{ color: 'var(--os-text-muted)' }}>
                                {w.minimized ? 'Minimized' : `${w.rect.w} × ${w.rect.h}`}
                              </span>
                            </span>
                          </span>
                        </button>
                        <button
                          className="wc absolute top-2 right-2"
                          aria-label={`Close ${w.title}`}
                          style={{ background: 'color-mix(in srgb, var(--os-text) 8%, transparent)' }}
                          onClick={() => closeApp(w.appId)}
                        >
                          <StatusGlyphs.close size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-center pb-9">
            <button className="h-10 px-6 rounded-lg text-[12.5px] font-medium surface" onClick={closeTaskView}>
              Close task view
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 * Widgets board
 * ------------------------------------------------------------------ */

export function WidgetsBoard() {
  const open = useOS((s) => s.widgetsOpen);
  const close = () => useOS.setState({ widgetsOpen: false });
  const wallpaper = useOS((s) => s.wallpaper);
  const openApp = useOS((s) => s.openApp);
  const now = new Date();

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[1220]" onPointerDown={close} />
          <motion.div
            className="fixed inset-0 z-[1230] flex justify-start p-5 pb-16 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <motion.div
              className="pointer-events-auto w-full max-w-[430px] h-full overflow-y-auto pr-1 space-y-3"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0, transition: { duration: 0.14 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="widget">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
                      Lahore
                    </p>
                    <p className="text-[34px] font-light leading-none mt-1">29°</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--os-text-muted)' }}>
                      Hazy sun · feels like 33°
                    </p>
                  </div>
                  <StatusGlyphs.sun size={42} strokeWidth={1.2} style={{ color: '#f0b429' }} />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {['Mon', 'Tue', 'Wed', 'Thu'].map((d, i) => (
                    <div key={d} className="text-center">
                      <p className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
                        {d}
                      </p>
                      <StatusGlyphs.cloud size={18} className="mx-auto my-1 opacity-70" />
                      <p className="text-[12px] font-medium">{31 - i}°</p>
                      <p className="text-[10.5px]" style={{ color: 'var(--os-text-muted)' }}>
                        {23 - i}°
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="widget">
                <p className="text-[12px] font-semibold flex items-center gap-1.5 mb-3">
                  <ClockIcon size={13} /> Today
                </p>
                <p className="text-[13px] font-medium">
                  {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { t: '09:30', label: 'Standup — Trellis', done: true },
                    { t: '11:00', label: 'Cadence migration review', done: true },
                    { t: '15:00', label: 'Write the jank post', done: false },
                    { t: '18:30', label: 'Rooftop, no laptop', done: false },
                  ].map((e) => (
                    <div key={e.t} className="flex items-center gap-2.5 text-[12px]">
                      <span className="tabular-nums w-10" style={{ color: 'var(--os-text-muted)' }}>
                        {e.t}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: e.done ? 'var(--os-text-muted)' : 'var(--os-accent)' }}
                      />
                      <span style={{ textDecoration: e.done ? 'line-through' : 'none', opacity: e.done ? 0.6 : 1 }}>
                        {e.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="widget">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold">Latest photos</p>
                  <button
                    className="text-[11px]"
                    style={{ color: 'var(--os-text-muted)' }}
                    onClick={() => {
                      close();
                      openApp('gallery', undefined, 'Photos');
                    }}
                  >
                    Open Photos
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.slice(0, 6).map((g) => (
                    <Img
                      key={g.id}
                      src={`./images/gallery/${g.file}`}
                      alt={g.caption}
                      loading="lazy"
                      width={140}
                      height={68}
                      className="w-full h-[68px] object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              <div className="widget">
                <p className="text-[12px] font-semibold mb-2">Wallpaper</p>
                <div className="grid grid-cols-4 gap-2">
                  {WALLPAPERS.map((w) => (
                    <button
                      key={w.id}
                      className="rounded-lg overflow-hidden relative transition-transform hover:scale-[1.04]"
                      style={{
                        outline: wallpaper === w.id ? '2px solid var(--os-accent)' : 'none',
                        outlineOffset: 2,
                      }}
                      onClick={() => useOS.getState().setWallpaper(w.id)}
                      title={w.label}
                    >
                      <Img src={`./images/wallpapers/${w.file}`} alt={w.label} className="w-full h-[46px] object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="widget">
                <p className="text-[12px] font-semibold mb-2">Now available for</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                  {profile.availability}
                </p>
                <button
                  className="mt-3 h-9 px-4 rounded-lg text-[12.5px] font-medium text-white flex items-center gap-2"
                  style={{ background: 'var(--os-accent)' }}
                  onClick={() => {
                    close();
                    openApp('contact', undefined, 'Contact');
                  }}
                >
                  <StatusGlyphs.send size={14} /> Start a conversation
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 * Notification pop-ups
 * ------------------------------------------------------------------ */

export function ToastHost() {
  const toasts = useOS((s) => s.toasts);
  const openApp = useOS((s) => s.openApp);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = toasts.slice(0, 3).filter((t) => !dismissed.includes(t.id));
  const ids = visible.map((v) => v.id).join(',');

  useEffect(() => {
    if (!ids) return;
    const list = ids.split(',');
    const timers = list.map((id) => window.setTimeout(() => setDismissed((d) => [...d, id]), 7000));
    return () => timers.forEach(window.clearTimeout);
  }, [ids]);

  return (
    <div className="fixed right-3 bottom-[58px] z-[1400] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {visible.map((t) => (
          <motion.button
            key={t.id}
            className="w-[320px] p-3 rounded-xl text-left pointer-events-auto surface"
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 34, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={() => {
              setDismissed((d) => [...d, t.id]);
              openApp(t.appId, undefined, t.title);
            }}
          >
            <span className="flex gap-2.5">
              <AppIcon id={t.appId} size={28} radius={7} />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold truncate">{t.title}</span>
                <span className="block text-[11.5px] leading-snug mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                  {t.body}
                </span>
              </span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
