import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOS, WALLPAPERS, ACCENTS, type WallpaperId } from '../../store/os';
import { profile, skillGroups, experience } from '../../data/profile';
import { StatusGlyphs, AppIcon } from '../../lib/icons';
import { APPS } from '../../data/apps';
import { Img } from '../ui/Img';

const { sun: SunIcon, moon: MoonIcon, check: CheckIcon, info: InfoIcon, refresh: ReloadIcon, power: PowerIcon, bell: BellIcon, monitor: _m } = { ...StatusGlyphs, monitor: StatusGlyphs.expand };

type Tab = 'appearance' | 'system' | 'notifications' | 'about';

export function SettingsApp({ payload }: { payload?: Record<string, unknown> }) {
  const initial = (payload?.tab as Tab) ?? 'appearance';
  const [tab, setTab] = useState<Tab>(initial);
  const s = useOS();
  const pushToast = useOS((st) => st.pushToast);

  useEffect(() => {
    if (payload?.tab) setTab(payload.tab as Tab);
  }, [payload?.tab]);

  const tabs: { id: Tab; label: string; icon: typeof InfoIcon }[] = [
    { id: 'appearance', label: 'Appearance', icon: StatusGlyphs.gridView },
    { id: 'system', label: 'System', icon: InfoIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'about', label: 'About', icon: InfoIcon },
  ];

  return (
    <div className="h-full flex">
      <nav className="w-[194px] shrink-0 border-r p-2.5 space-y-0.5 hidden sm:block" style={{ borderColor: 'var(--os-border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-3 mb-1">
          <span
            className="grid place-items-center rounded-full text-[12px] font-semibold text-white"
            style={{ width: 32, height: 32, background: 'linear-gradient(140deg,#8fc0ff,var(--os-accent))' }}
          >
            RM
          </span>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-medium truncate">{profile.name}</span>
            <span className="block text-[10.5px] truncate" style={{ color: 'var(--os-text-muted)' }}>
              {profile.email}
            </span>
          </span>
        </div>

        {tabs.map((t) => (
          <button
            key={t.id}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-left transition-colors"
            style={{
              background: tab === t.id ? 'color-mix(in srgb, var(--os-text) 9%, transparent)' : 'transparent',
              fontWeight: tab === t.id ? 500 : 400,
            }}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={15} strokeWidth={1.7} />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="p-5">
          {tab === 'appearance' && (
            <div className="max-w-[68ch] space-y-5">
              <Header title="Appearance" sub="Everything here applies instantly and is remembered on this device." />

              <Card title="Theme">
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'light' as const, label: 'Light', icon: SunIcon, preview: 'linear-gradient(135deg,#f6f8fc,#dfe7f5)' },
                      { id: 'dark' as const, label: 'Dark', icon: MoonIcon, preview: 'linear-gradient(135deg,#14171e,#2a2f3a)' },
                    ]
                  ).map((t) => (
                    <button
                      key={t.id}
                      className="rounded-xl overflow-hidden text-left panel card-hover"
                      style={{ outline: s.theme === t.id ? '2px solid var(--os-accent)' : 'none', outlineOffset: 2 }}
                      onClick={() => s.setTheme(t.id)}
                    >
                      <span className="block h-[86px]" style={{ background: t.preview }} />
                      <span className="flex items-center gap-2 p-3">
                        <t.icon size={15} />
                        <span className="text-[12.5px] font-medium flex-1">{t.label}</span>
                        {s.theme === t.id && <CheckIcon size={15} style={{ color: 'var(--os-accent)' }} />}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Accent colour">
                <div className="flex flex-wrap gap-2.5">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      className="flex items-center gap-2.5 pl-1.5 pr-3.5 h-9 rounded-full panel transition-transform hover:scale-[1.03]"
                      style={{ outline: s.accent === a.hex ? `2px solid ${a.hex}` : 'none', outlineOffset: 2 }}
                      onClick={() => s.setAccent(a.hex)}
                    >
                      <span className="w-6 h-6 rounded-full grid place-items-center" style={{ background: a.hex }}>
                        {s.accent === a.hex && <CheckIcon size={13} color="#fff" />}
                      </span>
                      <span className="text-[12px]">{a.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Wallpaper">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {WALLPAPERS.map((w) => (
                    <button
                      key={w.id}
                      className="rounded-xl overflow-hidden panel card-hover text-left"
                      style={{ outline: s.wallpaper === w.id ? '2px solid var(--os-accent)' : 'none', outlineOffset: 2 }}
                      onClick={() => s.setWallpaper(w.id as WallpaperId)}
                    >
                      <Img src={`./images/wallpapers/${w.file}`} alt={w.label} className="w-full h-[70px] object-cover" />
                      <span className="flex items-center gap-2 p-2.5">
                        <span className="text-[11.5px] flex-1">{w.label}</span>
                        {s.wallpaper === w.id && <CheckIcon size={13} style={{ color: 'var(--os-accent)' }} />}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Screen">
                <SliderRow label="Brightness" value={s.brightness} min={35} max={100} onChange={s.setBrightness} suffix="%" />
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[12.5px]">Night light</span>
                  <Switch on={s.nightLight} onToggle={() => s.patchQuick({ nightLight: !s.nightLight })} />
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[12.5px]">Focus mode</span>
                  <Switch on={s.focusMode} onToggle={() => s.toggleFocus()} />
                </div>
              </Card>

              <Card title="Sound">
                <SliderRow label="Master volume" value={s.muted ? 0 : s.volume} min={0} max={100} onChange={s.setVolume} suffix="%" />
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[12.5px]">Mute output</span>
                  <Switch on={s.muted} onToggle={() => s.patchQuick({ muted: !s.muted })} />
                </div>
              </Card>
            </div>
          )}

          {tab === 'system' && (
            <div className="max-w-[68ch] space-y-5">
              <Header title="System" sub="Connectivity, storage and the tools installed on this machine." />
              <Card title="Network">
                {[
                  { k: 'Wifi', v: s.wifi, set: (v: boolean) => s.patchQuick({ wifi: v }) },
                  { k: 'Bluetooth', v: s.bluetooth, set: (v: boolean) => s.patchQuick({ bluetooth: v }) },
                  { k: 'Airplane mode', v: s.airplane, set: (v: boolean) => s.patchQuick({ airplane: v }) },
                ].map((r) => (
                  <div key={r.k} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-[12.5px]">{r.k}</p>
                      <p className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
                        {r.v ? (r.k === 'Wifi' ? 'Connected to Studio-Meridian' : 'On') : 'Off'}
                      </p>
                    </div>
                    <Switch on={r.v} onToggle={() => r.set(!r.v)} />
                  </div>
                ))}
              </Card>

              <Card title="Storage">
                <div className="space-y-3">
                  {[
                    { l: 'Projects', v: 46, c: '#5c83ff' },
                    { l: 'Media', v: 28, c: '#d4568f' },
                    { l: 'Documents', v: 9, c: '#4f9d5a' },
                    { l: 'System', v: 6, c: '#e0a63a' },
                    { l: 'Free', v: 11, c: '#8a8f99' },
                  ].map((r) => (
                    <div key={r.l}>
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <span>{r.l}</span>
                        <span style={{ color: 'var(--os-text-muted)' }}>{r.v}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--os-text) 10%, transparent)' }}>
                        <motion.span
                          className="block h-full rounded-full"
                          style={{ background: r.c }}
                          initial={{ width: 0 }}
                          animate={{ width: `${r.v}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Installed applications">
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {APPS.map((a) => (
                    <div key={a.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--os-text) 4%, transparent)' }}>
                      <AppIcon id={a.id} size={26} radius={7} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-medium truncate">{a.name}</span>
                        <span className="block text-[10.5px] truncate" style={{ color: 'var(--os-text-muted)' }}>
                          {a.subtitle}
                        </span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: 'color-mix(in srgb, var(--os-text) 9%, transparent)', color: 'var(--os-text-muted)' }}>
                        {a.id === 'snake' || a.id === 'store' ? 'optional' : 'system'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="max-w-[68ch] space-y-5">
              <Header title="Notifications" sub="What this desktop is allowed to tell you about." />
              <Card title="Quick toggles">
                {[
                  { k: 'App launches', d: 'Notify when a window loads', on: true },
                  { k: 'Ambient sound reminders', d: 'Suggest the Sound Lab after long sessions', on: false },
                  { k: 'Visitor notes', d: 'Notify when someone writes on the Memory Wall', on: true },
                  { k: 'Weekly summary', d: 'A recap of what changed on this machine', on: false },
                ].map((r) => (
                  <ToggleRow key={r.k} label={r.k} desc={r.d} defaultOn={r.on} />
                ))}
              </Card>

              <Card title="Recent">
                <div className="space-y-1.5">
                  {s.toasts.length === 0 && (
                    <p className="text-[12.5px] py-3" style={{ color: 'var(--os-text-muted)' }}>
                      Nothing yet. Open a couple of apps and they will show up here.
                    </p>
                  )}
                  {s.toasts.map((t) => (
                    <div key={t.id} className="flex gap-2.5 p-2.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}>
                      <AppIcon id={t.appId} size={26} radius={7} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-medium">{t.title}</span>
                        <span className="block text-[11.5px]" style={{ color: 'var(--os-text-muted)' }}>
                          {t.body}
                        </span>
                      </span>
                      <span className="text-[10.5px] shrink-0" style={{ color: 'var(--os-text-muted)' }}>
                        {new Date(t.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
                {s.toasts.length > 0 && (
                  <button
                    className="mt-3 h-8 px-3 rounded-lg text-[12px]"
                    style={{ background: 'color-mix(in srgb, var(--os-text) 8%, transparent)' }}
                    onClick={s.clearToasts}
                  >
                    Clear all notifications
                  </button>
                )}
              </Card>
            </div>
          )}

          {tab === 'about' && (
            <div className="max-w-[68ch] space-y-5">
              <Header title="About this PC" sub="RayanOS 4.2 — a portfolio that behaves like a desktop." />

              <Card title="Device">
                <dl className="space-y-2.5 text-[12.5px]">
                  <KV k="Name" v="RAYAN-DESKTOP" />
                  <KV k="Edition" v="RayanOS 4.2 (Studio Meridian build)" />
                  <KV k="Processor" v="React 19 renderer @ 60fps" />
                  <KV k="Installed memory" v="TypeScript, 19 packages" />
                  <KV k="Storage" v={`${APPS.length} applications, 4 wallpapers`} />
                  <KV k="Renderer" v="Vite 6 production bundle" />
                </dl>
              </Card>

              <Card title="Owner">
                <div className="flex items-start gap-4">
                  <Img
                    src="./images/profile/rayan-malik-portrait.jpg"
                    alt={profile.name}
                    className="w-[92px] h-[92px] rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-[14px] font-semibold">{profile.name}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                      {profile.role} · {profile.roleSecondary} · {profile.location}
                    </p>
                    <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: 'var(--os-text-muted)' }}>
                      {profile.summary}
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Specs of the person">
                <div className="grid sm:grid-cols-2 gap-2">
                  {skillGroups.map((g) => (
                    <div key={g.group} className="rounded-lg p-3" style={{ background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}>
                      <p className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
                        {g.group}
                      </p>
                      <p className="text-[12px] leading-relaxed">{g.items.slice(0, 5).join(' · ')}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Actions">
                <div className="flex flex-wrap gap-2">
                  <button className="chip" onClick={() => s.setPhase('boot')}>
                    <ReloadIcon size={13} /> Restart this machine
                  </button>
                  <button
                    className="chip"
                    onClick={() => {
                      try {
                        localStorage.removeItem('rayanos-shell-v1');
                        pushToast({ appId: 'settings', title: 'Settings reset', body: 'Reload the page to see a factory-fresh desktop.' });
                      } catch {
                        pushToast({ appId: 'settings', title: 'Could not reset', body: 'Storage is unavailable in this browser context.' });
                      }
                    }}
                  >
                    <PowerIcon size={13} /> Reset saved preferences
                  </button>
                  <a className="chip" href="https://github.com/" target="_blank" rel="noreferrer noopener">
                    <StatusGlyphs.github size={13} /> View the source
                  </a>
                </div>
                <p className="text-[11.5px] mt-3" style={{ color: 'var(--os-text-muted)' }}>
                  {experience.length} roles on record · built and maintained by {profile.name}, {profile.location}.
                </p>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <header>
      <h2 className="text-[19px] font-semibold">{title}</h2>
      <p className="text-[12.5px] mt-1" style={{ color: 'var(--os-text-muted)' }}>
        {sub}
      </p>
    </header>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl p-4 panel">
      <h3 className="text-[13px] font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: 'var(--os-text-muted)' }}>{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-[12.5px] mb-1.5">
        <span>{label}</span>
        <span className="tabular-nums" style={{ color: 'var(--os-text-muted)' }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ ['--pct' as string]: `${((value - min) / (max - min)) * 100}%` }}
        aria-label={label}
      />
    </div>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative shrink-0 transition-colors"
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: on ? 'var(--os-accent)' : 'color-mix(in srgb, var(--os-text) 22%, transparent)',
        border: '1px solid ' + (on ? 'var(--os-accent)' : 'var(--os-border-strong)'),
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-all"
        style={{ width: 16, height: 16, top: 2, left: on ? 20 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.35)' }}
      />
    </button>
  );
}

function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-[12.5px]">{label}</p>
        <p className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
          {desc}
        </p>
      </div>
      <Switch on={on} onToggle={() => setOn((v) => !v)} />
    </div>
  );
}
