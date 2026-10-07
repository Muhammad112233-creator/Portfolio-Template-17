import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { profile } from '../../data/profile';
import { StatusGlyphs } from '../../lib/icons';

const { chevronRight: Chevron, power: PowerIcon, sun: SunIcon, refresh: RefreshIcon, moon: MoonIcon } = StatusGlyphs;

/* ------------------------------------------------------------------ *
 * Boot sequence
 * ------------------------------------------------------------------ */

export function BootScreen() {
  const phase = useOS((s) => s.phase);
  const setPhase = useOS((s) => s.setPhase);
  const closeApp = useOS((s) => s.closeApp);
  const active = phase === 'boot';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    // Reset the workspace on a restart, then step through the boot beats.
    useOS.setState({ windows: [], startOpen: false, searchOpen: false, taskViewOpen: false });

    const steps = [420, 900, 1300];
    const timers = steps.map((ms, i) =>
      window.setTimeout(() => setProgress(i + 1), ms)
    );
    const done = window.setTimeout(() => setPhase('lock'), 2450);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [active, setPhase]);

  if (!active) return null;

  return (
    <motion.div
      className="boot-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col items-center gap-7"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <LogoMark />
        <div className="text-center">
          <p className="text-[15px] font-light tracking-[0.16em] uppercase opacity-95">RayanOS</p>
          <p className="text-[11.5px] mt-1.5 opacity-45">Version 4.2 · Studio Meridian build</p>
        </div>
        <div className="boot-spinner" aria-label="Starting up" role="status" />
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="boot-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p className="text-[11px] opacity-35 tabular-nums">
          {['Firmware check', 'Mounting D:/Projects', 'Starting shell', 'Ready'][Math.min(progress, 3)]}
        </p>
      </div>
    </motion.div>
  );
}

function LogoMark() {
  return (
    <motion.svg
      width="82"
      height="82"
      viewBox="0 0 82 82"
      initial={{ scale: 0.86, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 20 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8fc0ff" />
          <stop offset="52%" stopColor="#5c83ff" />
          <stop offset="100%" stopColor="#8d6bff" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b2340" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4b6bd8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <motion.rect
        x="6"
        y="6"
        width="70"
        height="70"
        rx="18"
        fill="url(#lg2)"
        stroke="url(#lg1)"
        strokeWidth="1.4"
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M28 56 V26 h13 a10 10 0 0 1 0 20 h-13"
        fill="none"
        stroke="url(#lg1)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 1.1, ease: 'easeInOut' }}
      />
      <motion.path
        d="M43 46 l12 10"
        fill="none"
        stroke="url(#lg1)"
        strokeWidth="3.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.2, duration: 0.45 }}
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ *
 * Lock screen
 * ------------------------------------------------------------------ */

export function LockScreen() {
  const phase = useOS((s) => s.phase);
  const setPhase = useOS((s) => s.setPhase);
  const wallpaper = useOS((s) => s.wallpaper);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = phase === 'lock';

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 20);
    return () => window.clearInterval(id);
  }, []);

  const unlock = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setPhase('desktop');
    }, 520);
  };

  if (!active) return null;

  return (
    <motion.div
      className="lock-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.45 }}
    >
      <div
        className="desktop-wallpaper desktop-wallpaper--dim"
        style={{ backgroundImage: `url(./images/wallpapers/${wallpaper === 'ridge' ? 'ridge' : wallpaper}.jpg)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(3,6,14,.55) 0%, rgba(3,6,14,.28) 42%, rgba(3,6,14,.78) 100%)' }}
      />

      <motion.div
        className="relative flex-1 flex flex-col items-start justify-center pl-[7vw] pr-6"
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
      >
        <p className="text-[52px] sm:text-[68px] font-light leading-none tabular-nums">
          {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-[15px] mt-2 opacity-80">
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        <div className="flex items-center gap-4 mt-6 opacity-80">
          <span className="flex items-center gap-1.5 text-[12px]">
            <SunIcon size={14} /> 29°C Lahore
          </span>
          <span className="flex items-center gap-1.5 text-[12px]">
            <StatusGlyphs.clock size={14} /> {profile.timezone}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="relative pb-[9vh] grid place-items-center"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className="lock-card"
          animate={error ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center text-center">
            <span
              className="grid place-items-center rounded-full text-[21px] font-semibold"
              style={{
                width: 62,
                height: 62,
                background: 'linear-gradient(140deg,#8fc0ff,#5c83ff)',
                boxShadow: '0 10px 30px -10px rgba(92,131,255,.9)',
              }}
            >
              RM
            </span>
            <p className="text-[16px] font-medium mt-3">{profile.name}</p>
            <p className="text-[11.5px] opacity-60 mt-0.5">{profile.role} · {profile.roleSecondary}</p>

            <div className="w-full mt-4 relative">
              <input
                ref={inputRef}
                type="password"
                value={value}
                autoFocus
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (value.trim().length >= 4) unlock();
                    else {
                      setError(true);
                      window.setTimeout(() => setError(false), 600);
                    }
                  }
                }}
                placeholder="Any four characters will do"
                className="w-full h-10 rounded-lg px-3 pr-11 text-[13px] outline-none"
                style={{
                  background: 'rgba(255,255,255,.12)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: '#fff',
                }}
                aria-label="Passcode"
                disabled={busy}
              />
              <button
                className="absolute right-1.5 top-1.5 w-7 h-7 grid place-items-center rounded-md transition-colors hover:bg-white/15 disabled:opacity-40"
                onClick={() => {
                  if (value.trim().length >= 4) unlock();
                  else {
                    setError(true);
                    window.setTimeout(() => setError(false), 600);
                  }
                }}
                disabled={busy}
                aria-label="Unlock"
              >
                {busy ? <StatusGlyphs.spinner size={15} className="animate-spin" /> : <Chevron size={17} />}
              </button>
            </div>

            <button
              className="mt-3 text-[12px] opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1.5"
              onClick={unlock}
            >
              <PowerIcon size={13} /> Just let me in
            </button>
          </div>
        </motion.div>

        <p className="text-[10.5px] opacity-45 mt-4 max-w-[320px] text-center">
          This passcode is decorative — the demo unlocks with anything four characters or longer.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Sleep + shutdown
 * ------------------------------------------------------------------ */

export function PowerScreens() {
  const phase = useOS((s) => s.phase);
  const setPhase = useOS((s) => s.setPhase);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (phase === 'sleeping') {
      const t = window.setTimeout(() => setPhase('lock'), 1400);
      return () => window.clearTimeout(t);
    }
    if (phase === 'shutdown') {
      setShowConfirm(true);
    } else {
      setShowConfirm(false);
    }
  }, [phase, setPhase]);

  return (
    <AnimatePresence>
      {phase === 'sleeping' && (
        <motion.div
          key="sleep"
          className="fixed inset-0 z-[2600] bg-black grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="text-white/45 text-[12px] tracking-[0.28em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sleeping
          </motion.p>
        </motion.div>
      )}

      {phase === 'shutdown' && showConfirm && (
        <motion.div
          key="shutdown"
          className="fixed inset-0 z-[2650] grid place-items-center px-5"
          style={{ background: 'rgba(3,6,14,.82)', backdropFilter: 'blur(22px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="lock-card w-[340px]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <p className="text-[15px] font-medium">What would you like to do?</p>
            <div className="mt-4 space-y-1.5">
              {[
                { icon: MoonIcon, label: 'Sleep', action: () => setPhase('sleeping') },
                { icon: RefreshIcon, label: 'Restart', action: () => setPhase('boot') },
                { icon: PowerIcon, label: 'Shut down', action: () => setPhase('boot') },
              ].map((o) => (
                <button
                  key={o.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors hover:bg-white/10"
                  onClick={o.action}
                >
                  <o.icon size={16} />
                  {o.label}
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full h-9 rounded-lg text-[12.5px]"
              style={{ background: 'rgba(255,255,255,.1)' }}
              onClick={() => setPhase('desktop')}
            >
              Never mind, take me back
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
