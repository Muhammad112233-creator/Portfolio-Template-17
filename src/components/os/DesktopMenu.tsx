import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS, WALLPAPERS } from '../../store/os';
import { StatusGlyphs, AppIcon } from '../../lib/icons';
import { APPS } from '../../data/apps';

const { plus: PlusIcon, refresh: RefreshIcon, gridView: GridIcon, listView: ListIcon, check: CheckIcon, pin: PinIcon, settings: CogIcon, terminal: TermIcon } = StatusGlyphs;

interface MenuState {
  x: number;
  y: number;
}

/**
 * Right-click menu on the desktop. Also where a pasted-clipboard note becomes a
 * desktop file, which is a small joke that people tend to enjoy.
 */
export function DesktopMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [pinnedNote, setPinnedNote] = useState(false);
  const openApp = useOS((s) => s.openApp);
  const pushToast = useOS((s) => s.pushToast);
  const setWallpaper = useOS((s) => s.setWallpaper);
  const wallpaper = useOS((s) => s.wallpaper);
  const toggleTaskView = useOS((s) => s.toggleTaskView);

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // only the desktop surface itself responds
      if (target.closest('[data-window-body], .taskbar, .start-menu, .flyout, [role="dialog"]')) return;
      e.preventDefault();
      setMenu({ x: Math.min(e.clientX, window.innerWidth - 260), y: Math.min(e.clientY, window.innerHeight - 340) });
      setSubmenu(null);
    };
    const close = () => setMenu(null);
    window.addEventListener('contextmenu', onContext);
    window.addEventListener('pointerdown', close);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('contextmenu', onContext);
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('resize', close);
    };
  }, []);

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          className="fixed z-[1500] w-[248px] p-1.5 rounded-xl surface"
          style={{ left: menu.x, top: menu.y }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.1 } }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          onPointerDown={(e) => e.stopPropagation()}
          role="menu"
        >
          <Row
            icon={<GridIcon size={15} />}
            label="Task view"
            hint="Ctrl+Alt+Tab"
            onClick={() => {
              toggleTaskView(true);
              setMenu(null);
            }}
          />

          <Divider />

          <div
            className="relative"
            onMouseEnter={() => setSubmenu('view')}
            onMouseLeave={() => setSubmenu((s) => (s === 'view' ? null : s))}
          >
            <Row icon={<ListIcon size={15} />} label="View" arrow onClick={() => setSubmenu('view')} />
            <AnimatePresence>
              {submenu === 'view' && (
                <motion.div
                  className="absolute left-[236px] top-0 w-[190px] p-1.5 rounded-xl surface"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4, transition: { duration: 0.1 } }}
                >
                  {(['large', 'medium', 'small'] as const).map((s) => (
                    <Row
                      key={s}
                      icon={iconSize === s ? <CheckIcon size={14} /> : <span className="w-[14px]" />}
                      label={`${s[0].toUpperCase()}${s.slice(1)} icons`}
                      onClick={() => {
                        setIconSize(s);
                        setMenu(null);
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setSubmenu('wall')}
            onMouseLeave={() => setSubmenu((s) => (s === 'wall' ? null : s))}
          >
            <Row icon={<PinIcon size={15} />} label="Wallpaper" arrow onClick={() => setSubmenu('wall')} />
            <AnimatePresence>
              {submenu === 'wall' && (
                <motion.div
                  className="absolute left-[236px] top-0 w-[190px] p-1.5 rounded-xl surface"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4, transition: { duration: 0.1 } }}
                >
                  {WALLPAPERS.map((w) => (
                    <Row
                      key={w.id}
                      icon={wallpaper === w.id ? <CheckIcon size={14} /> : <span className="w-[14px]" />}
                      label={w.label}
                      onClick={() => {
                        setWallpaper(w.id);
                        setMenu(null);
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Divider />

          <Row
            icon={<PlusIcon size={15} />}
            label="New shortcut"
            onClick={() => {
              openApp('welcome', { newShortcut: true }, 'Welcome');
              setMenu(null);
            }}
          />

          <Row
            icon={<TermIcon size={15} />}
            label="New note from clipboard"
            onClick={async () => {
              setMenu(null);
              try {
                const text = await navigator.clipboard.readText();
                if (text.trim()) {
                  setPinnedNote(true);
                  pushToast({
                    appId: 'notepad',
                    title: 'Pasted to desktop',
                    body: 'Clipboard text became a desktop note.',
                  });
                } else {
                  pushToast({
                    appId: 'notepad',
                    title: 'Clipboard was empty',
                    body: 'RayanOS made a spark note instead.',
                  });
                }
              } catch {
                pushToast({
                  appId: 'notepad',
                  title: 'Clipboard unavailable',
                  body: 'The browser blocked clipboard access — the note app still works.',
                });
              }
            }}
          />

          <Divider />

          <Row
            icon={<CogIcon size={15} />}
            label="Personalise"
            onClick={() => {
              openApp('settings', { tab: 'appearance' }, 'Settings');
              setMenu(null);
            }}
          />
          <Row
            icon={<RefreshIcon size={15} />}
            label="Refresh desktop"
            onClick={() => {
              setMenu(null);
              pushToast({ appId: 'settings', title: 'Desktop refreshed', body: 'Nothing needed refreshing. You are welcome.' });
            }}
          />

          <Divider />

          <div className="px-2.5 py-2 grid grid-cols-5 gap-1">
            {APPS.slice(0, 10).map((a) => (
              <button
                key={a.id}
                className="grid place-items-center p-1.5 rounded-md hover:bg-white/10"
                title={a.name}
                onClick={() => {
                  openApp(a.id, undefined, a.name);
                  setMenu(null);
                }}
              >
                <AppIcon id={a.id} size={24} radius={6} />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {pinnedNote && <DesktopNote onClose={() => setPinnedNote(false)} />}
    </AnimatePresence>
  );
}

function Row({
  icon,
  label,
  hint,
  arrow,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  arrow?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[12.5px] text-left transition-colors hover:bg-white/10"
      onClick={onClick}
      role="menuitem"
    >
      <span className="grid place-items-center w-[16px] shrink-0 opacity-85">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="text-[10.5px] opacity-55">{hint}</span>}
      {arrow && <StatusGlyphs.chevronRight size={13} className="opacity-55" />}
    </button>
  );
}

function Divider() {
  return <div className="my-1 h-px" style={{ background: 'var(--os-border)' }} />;
}

function DesktopNote({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('Pasted from the clipboard. Delete me when you have read me.');
  return (
    <motion.div
      className="fixed z-[1160] w-[248px] p-3 rounded-lg"
      style={{ right: 300, bottom: 92, background: '#f5e6a8', color: '#3b3418', boxShadow: '0 18px 40px -14px rgba(0,0,0,.5)', rotate: '-1.4deg' }}
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold opacity-70">note.txt</span>
        <button onClick={onClose} aria-label="Close note" className="opacity-60 hover:opacity-100">
          <StatusGlyphs.close size={13} />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-[92px] bg-transparent resize-none outline-none text-[12px] leading-relaxed"
      />
    </motion.div>
  );
}
