import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOS } from './store/os';
import { BootScreen, LockScreen, PowerScreens } from './components/os/Splash';
import { DesktopIcons } from './components/os/DesktopIcons';
import { Taskbar } from './components/os/Taskbar';
import { StartMenu } from './components/os/StartMenu';
import { QuickPanel, SearchPanel, TaskView, WidgetsBoard, ToastHost } from './components/os/Flyouts';
import { WindowFrame } from './components/os/WindowFrame';
import { Guide } from './components/os/Guide';
import { DesktopMenu } from './components/os/DesktopMenu';
import { useInterval } from './hooks/useShell';
import { APPS } from './data/apps';

export default function App() {
  const phase = useOS((s) => s.phase);
  const setPhase = useOS((s) => s.setPhase);
  const booted = useOS((s) => s.booted);
  const windows = useOS((s) => s.windows);
  const theme = useOS((s) => s.theme);
  const accent = useOS((s) => s.accent);
  const wallpaper = useOS((s) => s.wallpaper);
  const brightness = useOS((s) => s.brightness);
  const nightLight = useOS((s) => s.nightLight);
  const focusMode = useOS((s) => s.focusMode);
  const openApp = useOS((s) => s.openApp);
  const closeAllFlyouts = useOS((s) => s.closeAllFlyouts);
  const tick = useOS((s) => s.tick);
  const startOpen = useOS((s) => s.startOpen);
  const taskViewOpen = useOS((s) => s.taskViewOpen);
  const searchOpen = useOS((s) => s.searchOpen);

  /* clock + battery drift */
  useInterval(tick, 1000);

  /* theme, accent and filters on the document root */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--os-accent', accent);
    root.style.setProperty('--os-accent-soft', hexToSoft(accent));
    root.style.setProperty('--os-brightness', String(brightness / 100));
    root.setAttribute('data-night', nightLight ? 'on' : 'off');

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0c12' : '#eef2f9');
  }, [theme, accent, brightness, nightLight]);

  /* skip the boot animation on repeat visits within the same session */
  useEffect(() => {
    if (booted && phase === 'boot' && sessionStorage.getItem('rayanos-seen') === '1') {
      setPhase('lock');
    }
  }, [booted, phase, setPhase]);

  /* keep open windows inside the viewport when it changes shape */
  useEffect(() => {
    const onResize = () => useOS.getState().clampWindows();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  /* global keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        const s = useOS.getState();
        if (s.searchOpen || s.startOpen || s.taskViewOpen || s.trayOpen || s.widgetsOpen) {
          s.closeAllFlyouts();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useOS.getState().toggleSearch(true);
        return;
      }

      if (typing) return;

      if (e.key === 'F1') {
        e.preventDefault();
        openApp('welcome', undefined, 'Welcome');
      }

      // Alt + number shortcuts for the first five pinned apps
      if (e.altKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const app = APPS.filter((a) => a.pinned)[Number(e.key) - 1];
        if (app) openApp(app.id, undefined, app.name);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openApp]);

  /* first-visit welcome tour */
  useEffect(() => {
    if (phase !== 'desktop') return;
    if (sessionStorage.getItem('rayanos-welcomed') === '1') return;
    const t = window.setTimeout(() => {
      sessionStorage.setItem('rayanos-welcomed', '1');
      openApp('welcome', undefined, 'Welcome');
      useOS.getState().pushToast({
        appId: 'welcome',
        title: 'Welcome to RayanOS',
        body: 'Press F1 for the tour, Ctrl+K to search, or just start opening things.',
      });
    }, 1100);
    return () => window.clearTimeout(t);
  }, [phase, openApp]);

  const shellVisible = phase === 'desktop';

  return (
    <div
      className="h-full w-full relative"
      style={{
        filter: nightLight ? 'sepia(.3) saturate(1.1) hue-rotate(-10deg) brightness(var(--os-brightness, 1))' : 'brightness(var(--os-brightness, 1))',
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          closeAllFlyouts();
        }
      }}
    >
      {/* wallpaper layer */}
      <div className="fixed inset-0 -z-10">
        <div
          className="desktop-wallpaper"
          style={{
            backgroundImage: `url(./images/wallpapers/${wallpaper}.jpg)`,
            filter: shellVisible ? 'none' : 'saturate(.85) brightness(.9)',
          }}
        />
        <div
          className="desktop-scrim"
          style={{
            background:
              theme === 'dark'
                ? 'radial-gradient(120% 120% at 50% 0%, rgba(8,11,20,.18) 0%, rgba(8,11,20,.52) 100%)'
                : 'radial-gradient(120% 120% at 50% 0%, rgba(8,11,20,.04) 0%, rgba(8,11,20,.3) 100%)',
          }}
        />
      </div>

      <BootScreen />
      <LockScreen />
      <PowerScreens />

      {shellVisible && (
        <>
          <DesktopIcons />

          <AnimatePresence>
            {windows.map((w) => (
              <WindowFrame
                key={w.id}
                win={w}
                active={w.z === useOS.getState().zTop && !w.minimized}
              />
            ))}
          </AnimatePresence>

          {focusMode && <div className="focus-veil" />}

          <Guide />
          <DesktopMenu />

          <StartMenu />
          <SearchPanel />
          <QuickPanel />
          <TaskView />
          <WidgetsBoard />
          <ToastHost />
          <Taskbar />
        </>
      )}
    </div>
  );
}

function hexToSoft(hex: string, alpha = 0.16) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const num = parseInt(full, 16);
  return `rgba(${num >> 16}, ${(num >> 8) & 0xff}, ${num & 0xff}, ${alpha})`;
}
