import { useEffect, useState } from 'react';
import { useOS } from '../../store/os';
import { AppIcon, BatteryGlyph, StatusGlyphs } from '../../lib/icons';
import { pinnedApps, appById } from '../../data/apps';
import type { AppId } from '../../store/os';

const { search: SearchIcon, grid: GridIcon, moon: MoonIcon, sun: SunIcon, volume: VolIcon, mute: MuteIcon, bell: BellIcon, chevronRight } = StatusGlyphs;

export function Taskbar() {
  const windows = useOS((s) => s.windows);
  const openApp = useOS((s) => s.openApp);
  const focusWindow = useOS((s) => s.focusWindow);
  const minimizeWindow = useOS((s) => s.minimizeWindow);
  const restoreApp = useOS((s) => s.restoreApp);
  const toggleStart = useOS((s) => s.toggleStart);
  const toggleSearch = useOS((s) => s.toggleSearch);
  const toggleTaskView = useOS((s) => s.toggleTaskView);
  const toggleTray = useOS((s) => s.toggleTray);
  const startOpen = useOS((s) => s.startOpen);
  const searchOpen = useOS((s) => s.searchOpen);
  const taskViewOpen = useOS((s) => s.taskViewOpen);
  const trayOpen = useOS((s) => s.trayOpen);
  const widgetOpen = useOS((s) => s.widgetsOpen);
  const toggleWidgets = useOS((s) => s.toggleWidgets);
  const closeAllFlyouts = useOS((s) => s.closeAllFlyouts);
  const theme = useOS((s) => s.theme);
  const toggleTheme = useOS((s) => s.toggleTheme);
  const volume = useOS((s) => s.volume);
  const muted = useOS((s) => s.muted);
  const wifi = useOS((s) => s.wifi);
  const battery = useOS((s) => s.battery);
  const charging = useOS((s) => s.charging);
  const toasts = useOS((s) => s.toasts);
  const clock = useOS((s) => s.clock);

  const [now, setNow] = useState(new Date(clock));

  useEffect(() => {
    setNow(new Date(clock));
  }, [clock]);

  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const unread = toasts.filter((t) => !t.read).length;

  /* group windows by app so each app shows once, like a real taskbar */
  const byApp = new Map<AppId, { id: string; minimized: boolean; activeZ: number }>();
  const zTop = windows.reduce((m, w) => Math.max(m, w.z), 0);
  for (const w of windows) {
    const prev = byApp.get(w.appId);
    if (!prev || w.z > prev.activeZ) {
      byApp.set(w.appId, { id: w.id, minimized: w.minimized, activeZ: w.z });
    }
  }

  const handleTaskClick = (appId: AppId) => {
    const group = byApp.get(appId);
    if (!group) {
      openApp(appId, undefined, appById(appId)?.name);
      return;
    }
    if (group.minimized) restoreApp(appId);
    else if (group.activeZ === zTop) minimizeWindow(group.id);
    else focusWindow(group.id);
  };

  const runningIds = [...byApp.keys()];
  const pinnedNotRunning = pinnedApps.filter((a) => !byApp.has(a.id));
  const taskButtons = [
    ...pinnedApps.map((a) => ({ id: a.id, label: a.name })),
    ...runningIds
      .filter((id) => !pinnedApps.some((a) => a.id === id))
      .map((id) => ({ id, label: appById(id)?.name ?? id })),
  ];

  return (
    <div className="taskbar" role="toolbar" aria-label="Taskbar">
      {/* weather chip */}
      <button
        className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-md text-xs transition-colors"
        style={{ color: 'var(--os-text-muted)' }}
        onClick={() => toggleWidgets()}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--os-text) 8%, transparent)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        aria-label="Open widgets"
        title="Widgets"
      >
        <StatusGlyphs.cloud size={17} strokeWidth={1.6} />
        <span className="leading-tight text-left">
          <span className="block font-medium" style={{ color: 'var(--os-text)' }}>
            29°C
          </span>
          <span className="block">Hazy sun</span>
        </span>
      </button>

      {/* centred cluster */}
      <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
        <button
          className={`tb-btn ${startOpen ? 'tb-btn--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleStart();
          }}
          title="Start"
          aria-label="Start"
          aria-expanded={startOpen}
        >
          <StartGlyph />
        </button>

        <button
          className={`tb-btn ${searchOpen ? 'tb-btn--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleSearch();
          }}
          title="Search"
          aria-label="Search"
        >
          <SearchIcon size={19} strokeWidth={1.7} />
        </button>

        <button
          className={`tb-btn ${taskViewOpen ? 'tb-btn--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskView();
          }}
          title="Task view"
          aria-label="Task view"
        >
          <GridIcon size={19} strokeWidth={1.7} />
        </button>

        <span className="hidden sm:block w-px h-6 mx-1.5" style={{ background: 'var(--os-border-strong)' }} />

        <div className="flex items-center gap-1 min-w-0 overflow-x-auto taskbar-strip">
          {taskButtons.map((t) => {
            const group = byApp.get(t.id);
            const isActive = group && !group.minimized && group.activeZ === zTop;
            return (
              <button
                key={t.id}
                className={`tb-btn ${group ? 'tb-btn--open' : ''} ${isActive ? 'tb-btn--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskClick(t.id);
                }}
                title={`${t.label}${group ? ' — running' : ''}`}
                aria-label={t.label}
              >
                <span className="relative inline-grid place-items-center">
                  <AppIcon id={t.id} size={26} radius={7} />
                </span>
                <span className="sr-only">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* system tray */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          className="tray-btn hidden lg:inline-flex"
          onClick={(e) => {
            e.stopPropagation();
            useOS.getState().setPhase('shutdown');
          }}
          title="Lock"
          aria-label="Lock screen"
        >
          <StatusGlyphs.power size={15} strokeWidth={1.7} />
        </button>

        <button
          className="tray-btn hidden md:inline-flex"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon size={15} strokeWidth={1.7} /> : <MoonIcon size={15} strokeWidth={1.7} />}
        </button>

        <button
          className="tray-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleTray();
          }}
          title="Network, sound, battery"
          aria-label="Network, sound, battery"
          aria-expanded={trayOpen}
        >
          <span className="flex items-center gap-2">
            {wifi ? <StatusGlyphs.wifi size={15} /> : <StatusGlyphs.wifiOff size={15} />}
            <span className="hidden sm:inline-flex items-center gap-1">
              {muted ? <MuteIcon size={15} /> : <VolIcon size={15} />}
            </span>
            <span className="flex items-center gap-1">
              <BatteryGlyph level={battery} charging={charging} />
              <span className="hidden sm:inline text-xs tabular-nums">{Math.round(battery)}%</span>
            </span>
          </span>
        </button>

        <button
          className="tray-btn hidden sm:inline-flex"
          onClick={(e) => {
            e.stopPropagation();
            useOS.getState().readToasts();
            toggleTray();
          }}
          title={`${unread} new notifications`}
          aria-label={`Notifications, ${unread} unread`}
        >
          <span className="relative">
            <BellIcon size={15} strokeWidth={1.7} />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] grid place-items-center text-white"
                style={{ background: 'var(--os-accent)' }}
              >
                {unread}
              </span>
            )}
          </span>
        </button>

        <button
          className="tray-btn text-right"
          title={`${date} ${time}`}
          aria-label={`${date} ${time}`}
          onClick={(e) => {
            e.stopPropagation();
            useOS.getState().readToasts();
            toggleTray();
          }}
        >
          <span className="leading-tight hidden sm:block">
            <span className="block text-xs tabular-nums">{time}</span>
            <span className="block text-[10.5px] tabular-nums" style={{ color: 'var(--os-text-muted)' }}>
              {date}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

/** Four-pane Start mark, drawn as SVG so it scales cleanly. */
function StartGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7cb3ff" />
          <stop offset="55%" stopColor="var(--os-accent)" />
          <stop offset="100%" stopColor="#8d6bff" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="8.6" height="8.6" rx="1.6" fill="url(#sg)" />
      <rect x="12.9" y="2.5" width="8.6" height="8.6" rx="1.6" fill="url(#sg)" opacity=".88" />
      <rect x="2.5" y="12.9" width="8.6" height="8.6" rx="1.6" fill="url(#sg)" opacity=".88" />
      <rect x="12.9" y="12.9" width="8.6" height="8.6" rx="1.6" fill="url(#sg)" opacity=".76" />
    </svg>
  );
}

/** Tiny chevron alias kept for readability in JSX above. */
export const ChevronRight = chevronRight;
