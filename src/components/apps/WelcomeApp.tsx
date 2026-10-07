import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { profile } from '../../data/profile';
import { StatusGlyphs, AppIcon } from '../../lib/icons';
import { projects } from '../../data/projects';
import { APPS } from '../../data/apps';
import { Img } from '../ui/Img';

const { chevronRight: Chevron, arrowRight: Arrow } = StatusGlyphs;

const STEPS = [
  {
    id: 'intro',
    eyebrow: 'Welcome to RayanOS',
    title: `Hi, I'm ${profile.name}.`,
    body: [
      profile.summary,
      'This portfolio is dressed as a desktop operating system. Everything you would normally find in a menu is here as a window: the biography, the case studies, the photos, the contact form. Nothing is hidden behind a loading screen.',
      'Open what you like. Drag the windows around. Close them and they stop existing, the way a real machine works.',
    ],
  },
  {
    id: 'work',
    eyebrow: 'The work',
    title: 'Three things worth opening first',
    body: [
      'If you only have two minutes, start with Cadence — a design system that four product teams actually adopted, and the migration work that made it stick.',
      'Then Trellis, a preview engine that puts a real URL on every branch in under nine seconds. After that, the writing, where the reasoning lives.',
    ],
  },
  {
    id: 'how',
    eyebrow: 'How this was made',
    title: 'Built the way I would build a product',
    body: [
      'React 19 and TypeScript on Vite, Zustand for the window manager, Tailwind for utilities and hand-written CSS for the acrylic surfaces. Framer Motion drives the boot sequence and the window springs.',
      'The desktop is a real state machine: windows carry their own z-order, the taskbar groups them by app, brightness is a genuine CSS filter, and your theme, accent, wallpaper and notes persist between visits.',
      'It is open source. Fork it and put your own name on the lock screen.',
    ],
  },
];

export function WelcomeApp({ payload }: { payload?: Record<string, unknown> }) {
  const [step, setStep] = useState(0);
  const closeApp = useOS((s) => s.closeApp);
  const openApp = useOS((s) => s.openApp);
  const pushToast = useOS((s) => s.pushToast);
  const s = STEPS[step];
  const newShortcut = Boolean(payload?.newShortcut);

  return (
    <div className="h-full flex flex-col">
      {/* hero */}
      <div
        className="relative px-7 pt-7 pb-6 shrink-0"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--os-accent) 16%, transparent) 0%, transparent 62%)',
          borderBottom: '1px solid var(--os-border)',
        }}
      >
        <div className="flex items-start gap-4">
          <AppIcon id="welcome" size={48} radius={13} />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--os-text-muted)' }}>
              {newShortcut ? 'New shortcut created' : s.eyebrow}
            </p>
            <h2 className="text-[22px] font-semibold mt-1 leading-tight">
              {newShortcut ? 'That worked — it is on your desktop now.' : s.title}
            </h2>
            <p className="text-[12.5px] mt-2" style={{ color: 'var(--os-text-muted)' }}>
              {profile.role} · {profile.roleSecondary} · {profile.location}
            </p>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="max-w-[62ch]"
        >
          {s.body.map((p, i) => (
            <p key={i} className="text-[13.5px] leading-[1.75] mb-3.5" style={{ color: i === 0 ? 'var(--os-text)' : 'var(--os-text-muted)' }}>
              {p}
            </p>
          ))}
        </motion.div>

        {step === 1 && (
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            {projects
              .filter((p) => p.featured)
              .slice(0, 3)
              .map((p, i) => (
                <motion.button
                  key={p.id}
                  className="text-left rounded-xl overflow-hidden panel card-hover"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => openApp('works', { projectId: p.id }, 'Workbench')}
                >
                  <Img src={`./images/projects/${p.image}`} alt={`${p.name} — ${p.kind}`} className="w-full h-[104px] object-cover" loading="lazy" />
                  <span className="block p-3">
                    <span className="block text-[12.5px] font-semibold">{p.name}</span>
                    <span className="block text-[11px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                      {p.kind} · {p.year}
                    </span>
                  </span>
                </motion.button>
              ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {[
              { k: 'Framework', v: 'React 19 + TypeScript' },
              { k: 'Build', v: 'Vite 6' },
              { k: 'State', v: 'Zustand with persistence' },
              { k: 'Styling', v: 'Tailwind + hand-written CSS layers' },
              { k: 'Motion', v: 'Framer Motion springs' },
              { k: 'Icons', v: 'Inline SVG, zero image sprites' },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}>
                <span className="text-[12px]" style={{ color: 'var(--os-text-muted)' }}>
                  {r.k}
                </span>
                <span className="text-[12.5px] font-medium">{r.v}</span>
              </div>
            ))}
          </div>
        )}

        {newShortcut && (
          <div className="mt-6">
            <p className="text-[12.5px] mb-2" style={{ color: 'var(--os-text-muted)' }}>
              Pick what the shortcut should point at:
            </p>
            <div className="flex flex-wrap gap-2">
              {APPS.slice(1, 9).map((a) => (
                <button
                  key={a.id}
                  className="chip"
                  onClick={() => {
                    openApp(a.id, undefined, a.name);
                    pushToast({ appId: a.id, title: 'Shortcut launched', body: `${a.name} is open. Drag it wherever you like.` });
                  }}
                >
                  <AppIcon id={a.id} size={16} radius={4} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          {profile.stats.map((st) => (
            <div key={st.label} className="rounded-xl p-3.5 panel">
              <p className="text-[24px] font-light leading-none">{st.value}</p>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--os-text-muted)' }}>
                {st.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* footer nav */}
      <div
        className="shrink-0 flex items-center justify-between px-7 py-3.5"
        style={{ borderTop: '1px solid var(--os-border)', background: 'color-mix(in srgb, var(--os-surface) 60%, transparent)' }}
      >
        <div className="flex items-center gap-1.5">
          {STEPS.map((x, i) => (
            <button
              key={x.id}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === step ? 22 : 8, background: i === step ? 'var(--os-accent)' : 'var(--os-border-strong)' }}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              className="h-9 px-4 rounded-lg text-[12.5px] font-medium"
              style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)' }}
              onClick={() => setStep((v) => v - 1)}
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              className="h-9 px-4 rounded-lg text-[12.5px] font-medium text-white flex items-center gap-1.5"
              style={{ background: 'var(--os-accent)' }}
              onClick={() => setStep((v) => v + 1)}
            >
              Next <Chevron size={14} />
            </button>
          ) : (
            <button
              className="h-9 px-4 rounded-lg text-[12.5px] font-medium text-white flex items-center gap-1.5"
              style={{ background: 'var(--os-accent)' }}
              onClick={() => {
                openApp('works', undefined, 'Workbench');
                closeApp('welcome');
              }}
            >
              Start with the work <Arrow size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
