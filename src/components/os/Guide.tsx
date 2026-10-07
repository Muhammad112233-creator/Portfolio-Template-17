import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { profile } from '../../data/profile';

interface Line {
  id: string;
  text: string;
  cta?: { label: string; run: () => void };
}

/**
 * The on-desktop guide. A small floating character that offers context-aware
 * hints. Never blocks a click — everything it does is also reachable from the
 * taskbar.
 */
export function Guide() {
  const openApp = useOS((s) => s.openApp);
  const [collapsed, setCollapsed] = useState(false);
  const [step, setStep] = useState(0);
  const [talking, setTalking] = useState(false);
  const windows = useOS((s) => s.windows);
  const phase = useOS((s) => s.phase);

  const lines = useMemo<Line[]>(
    () => [
      {
        id: 'hello',
        text: `Hey — I'm ${profile.shortName.split(' ')[0]}'s desktop guide. Double-click any icon, or let me show you around.`,
        cta: { label: 'Open the tour', run: () => openApp('welcome', undefined, 'Welcome') },
      },
      {
        id: 'work',
        text: 'The Workbench holds eight case studies. Each one has the problem, the approach and what actually changed.',
        cta: { label: 'Open Workbench', run: () => openApp('works', undefined, 'Workbench') },
      },
      {
        id: 'terminal',
        text: 'Power users: open Terminal and type "help". There are a few commands in there nobody documented.',
        cta: { label: 'Open Terminal', run: () => openApp('terminal', undefined, 'Terminal') },
      },
      {
        id: 'settings',
        text: 'Everything here is themeable — light or dark, six accent colours, four wallpapers and a real brightness filter.',
        cta: { label: 'Open Settings', run: () => openApp('settings', undefined, 'Settings') },
      },
      {
        id: 'contact',
        text: 'And when you are done poking around, the Contact app is the fastest way to reach a human.',
        cta: { label: 'Open Contact', run: () => openApp('contact', undefined, 'Contact') },
      },
    ],
    [openApp]
  );

  /* rotate hints slowly, and speed up while the character is talking */
  useEffect(() => {
    if (collapsed) return;
    const id = window.setInterval(() => {
      setTalking(true);
      setStep((s) => (s + 1) % lines.length);
      window.setTimeout(() => setTalking(false), 900);
    }, 11000);
    return () => window.clearInterval(id);
  }, [collapsed, lines.length]);

  useEffect(() => {
    setTalking(true);
    const t = window.setTimeout(() => setTalking(false), 900);
    return () => window.clearTimeout(t);
  }, [step]);

  if (phase !== 'desktop') return null;

  const line = lines[step];
  const crowded = windows.length > 0;

  return (
    <div
      className="fixed z-[1150] pointer-events-none hidden sm:block"
      style={{ right: 22, bottom: 68, width: 300 }}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            key={line.id}
            className="pointer-events-auto mb-2.5 rounded-2xl rounded-br-sm p-3.5 surface"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <p className="text-[12px] leading-relaxed">{line.text}</p>
            {line.cta && (
              <button
                className="mt-2.5 h-7 px-3 rounded-md text-[11.5px] font-medium text-white"
                style={{ background: 'var(--os-accent)' }}
                onClick={line.cta.run}
              >
                {line.cta.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="pointer-events-auto ml-auto flex items-end gap-2.5"
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? 'Show the guide' : 'Hide the guide'}
        aria-label={collapsed ? 'Show the desktop guide' : 'Hide the desktop guide'}
        animate={{ opacity: crowded ? 0.55 : 1 }}
        whileHover={{ opacity: 1 }}
      >
        <span className="text-[10.5px] px-2 py-1 rounded-md surface mb-1">
          {collapsed ? 'Show guide' : 'Hide'}
        </span>
        <Companion talking={talking && !collapsed} />
      </motion.button>
    </div>
  );
}

/** The companion character: pure SVG, animated with CSS. */
function Companion({ talking }: { talking: boolean }) {
  return (
    <span className="guide-float block" style={{ filter: 'drop-shadow(0 12px 22px rgba(6,10,22,.5))' }}>
      <svg width="86" height="86" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#dbe4ff" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="visorG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d2440" />
            <stop offset="100%" stopColor="#3b4b8f" />
          </linearGradient>
          <radialGradient id="glowG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c9cff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c9cff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="60" cy="62" r="46" fill="url(#glowG)" />

        {/* floating arms */}
        <motion.g
          animate={{ rotate: [0, -7, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '32px', originY: '62px' }}
        >
          <rect x="14" y="58" width="20" height="9" rx="4.5" fill="#c9d6ff" opacity="0.9" />
        </motion.g>
        <motion.g
          animate={{ rotate: [0, 7, 0] }}
          transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '88px', originY: '62px' }}
        >
          <rect x="86" y="58" width="20" height="9" rx="4.5" fill="#c9d6ff" opacity="0.9" />
        </motion.g>

        {/* head */}
        <rect x="26" y="26" width="68" height="62" rx="26" fill="url(#bodyG)" />
        <rect x="26" y="26" width="68" height="62" rx="26" fill="none" stroke="#aab8e8" strokeWidth="1.4" />

        {/* visor */}
        <rect x="36" y="42" width="48" height="26" rx="13" fill="url(#visorG)" />
        <rect x="36" y="42" width="48" height="9" rx="4.5" fill="#ffffff" opacity="0.14" />

        {/* eyes */}
        <g className="guide-blink" style={{ transformOrigin: '60px 55px' }}>
          <circle cx="51" cy="55" r="3.6" fill="#8fc0ff" />
          <circle cx="69" cy="55" r="3.6" fill="#8fc0ff" />
        </g>

        {/* mouth */}
        <g style={{ transformOrigin: '60px 70px' }}>
          <rect
            x="54"
            y="68"
            width="12"
            height="4"
            rx="2"
            fill="#8fc0ff"
            className={talking ? 'guide-talk' : ''}
            style={{ transformOrigin: '60px 70px' }}
          />
        </g>

        {/* antenna */}
        <rect x="58" y="14" width="4" height="14" rx="2" fill="#c9d6ff" />
        <motion.g
          style={{ transformOrigin: '60px 11px' }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.24, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="60" cy="11" r="5.5" fill="#7c9cff" />
        </motion.g>

        {/* base shadow */}
        <ellipse cx="60" cy="104" rx="24" ry="5" fill="#0b1024" opacity="0.24" />
      </svg>
    </span>
  );
}
