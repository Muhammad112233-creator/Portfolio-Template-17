import { useEffect, useMemo, useState } from 'react';
import { useOS, type AppId } from '../../store/os';
import { desktopApps, appById } from '../../data/apps';
import { AppIcon } from '../../lib/icons';

interface DesktopItem {
  key: string;
  appId: AppId;
  label: string;
}

/**
 * Desktop shortcuts.
 *
 * On a desktop the icons flow down the left edge and wrap into additional
 * columns when there are more than fit, exactly like a real shell. On narrow
 * screens they become a compact grid along the top so nothing is pushed off
 * the visible area.
 */
export function DesktopIcons() {
  const selected = useOS((s) => s.desktopSelected);
  const select = useOS((s) => s.selectDesktopIcon);
  const openApp = useOS((s) => s.openApp);
  const closeAllFlyouts = useOS((s) => s.closeAllFlyouts);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const items = useMemo<DesktopItem[]>(
    () => desktopApps.map((a) => ({ key: a.id, appId: a.id, label: a.name })),
    []
  );

  const launch = (item: DesktopItem) => {
    select(item.key);
    openApp(item.appId, undefined, appById(item.appId)?.name ?? item.label);
  };

  return (
    <div
      className={
        compact
          ? 'absolute top-2 left-2 right-2 z-10 grid grid-cols-4 gap-1'
          : 'absolute top-3 left-3 bottom-16 z-10 flex flex-col flex-wrap content-start gap-y-1'
      }
      style={compact ? undefined : { maxHeight: 'calc(100vh - 96px)', maxWidth: 110 }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          select(null);
          closeAllFlyouts();
        }
      }}
      role="list"
      aria-label="Desktop shortcuts"
    >
      {items.map((item) => {
        const isSelected = selected === item.key;
        return (
          <button
            key={item.key}
            role="listitem"
            className={`desk-icon ${isSelected ? 'desk-icon--selected' : ''} ${
              compact ? '!w-full !py-1.5 !gap-1' : ''
            }`}
            style={compact ? { width: '100%' } : undefined}
            onDoubleClick={() => launch(item)}
            onClick={() => select(item.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                launch(item);
              }
            }}
            title={`${item.label} — open`}
          >
            <AppIcon id={item.appId} size={compact ? 34 : 44} />
            <span
              className="desk-icon__label"
              style={compact ? { maxWidth: '100%', fontSize: 10.5, WebkitLineClamp: 1 } : undefined}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
