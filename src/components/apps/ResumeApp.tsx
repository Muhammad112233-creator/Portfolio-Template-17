import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { profile, experience, skillGroups, education, certifications, testimonials, timeline } from '../../data/profile';
import { StatusGlyphs } from '../../lib/icons';
import { Img } from '../ui/Img';

const { download: DownloadIcon, mail: MailIcon, printer: _p, check: CheckIcon } = { ...StatusGlyphs, printer: StatusGlyphs.check };

export function ResumeApp() {
  const pushToast = useOS((s) => s.pushToast);
  const openApp = useOS((s) => s.openApp);
  const [tab, setTab] = useState<'profile' | 'experience' | 'skills' | 'references'>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'experience' as const, label: 'Experience' },
    { id: 'skills' as const, label: 'Skills' },
    { id: 'references' as const, label: 'References' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* header card */}
      <div
        className="shrink-0 px-6 pt-5 pb-4"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--os-accent) 14%, transparent), transparent 70%)',
          borderBottom: '1px solid var(--os-border)',
        }}
      >
        <div className="flex items-start gap-4">
          <Img
            src="./images/profile/rayan-malik-portrait.jpg"
            alt={`${profile.name}, ${profile.role}`}
            className="w-[68px] h-[68px] rounded-xl object-cover shrink-0"
            style={{ boxShadow: '0 8px 24px -10px rgba(0,0,0,.5)' }}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[19px] font-semibold leading-tight">{profile.name}</h2>
            <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
              {profile.role} · {profile.roleSecondary} · {profile.location}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
                <StatusGlyphs.mail size={12} /> {profile.email}
              </span>
              <span className="w-px h-3.5" style={{ background: 'var(--os-border)' }} />
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
                <StatusGlyphs.clock size={12} /> {profile.timezone}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              className="h-8 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
              style={{ background: 'color-mix(in srgb, var(--os-text) 8%, transparent)' }}
              onClick={() => {
                window.print();
                pushToast({ appId: 'resume', title: 'Print dialog requested', body: 'Save as PDF for a copy of this resume.' });
              }}
            >
              <DownloadIcon size={14} /> Save
            </button>
            <button
              className="h-8 px-3 rounded-lg text-[12px] font-medium text-white flex items-center gap-1.5"
              style={{ background: 'var(--os-accent)' }}
              onClick={() => openApp('contact', undefined, 'Contact')}
            >
              <MailIcon size={14} /> Contact
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4 -mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              className="h-8 px-3 rounded-t-lg text-[12.5px] relative transition-colors"
              style={{
                background: tab === t.id ? 'var(--os-surface)' : 'transparent',
                color: tab === t.id ? 'var(--os-text)' : 'var(--os-text-muted)',
                borderTop: tab === t.id ? '1px solid var(--os-border)' : '1px solid transparent',
                borderLeft: tab === t.id ? '1px solid var(--os-border)' : '1px solid transparent',
                borderRight: tab === t.id ? '1px solid var(--os-border)' : '1px solid transparent',
              }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          {tab === 'profile' && (
            <div className="grid lg:grid-cols-[1.55fr_1fr] gap-6">
              <div>
                <Block title="Summary">
                  {profile.longBio.map((p, i) => (
                    <p key={i} className="text-[13.5px] leading-[1.8] mb-3" style={{ color: i === 0 ? 'var(--os-text)' : 'var(--os-text-muted)' }}>
                      {p}
                    </p>
                  ))}
                </Block>

                <Block title="Timeline">
                  <div className="relative pl-5">
                    <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px" style={{ background: 'var(--os-border-strong)' }} />
                    {timeline.map((t) => (
                      <div key={t.year} className="relative pb-3.5 last:pb-0">
                        <span className="absolute -left-5 top-[5px] w-2.5 h-2.5 rounded-full" style={{ background: 'var(--os-accent)' }} />
                        <p className="text-[12px] font-semibold tabular-nums">{t.year}</p>
                        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                          {t.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </Block>
              </div>

              <aside className="space-y-4">
                <div className="rounded-xl p-4 panel">
                  <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
                    How I work
                  </p>
                  <div className="space-y-3.5">
                    {profile.values.map((v) => (
                      <div key={v.title}>
                        <p className="text-[12.5px] font-semibold">{v.title}</p>
                        <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                          {v.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-4 panel">
                  <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
                    At a glance
                  </p>
                  <dl className="space-y-2 text-[12.5px]">
                    <Row k="Based in" v={profile.location} />
                    <Row k="Experience" v="9 years" />
                    <Row k="Focus" v="Editor tooling, design systems" />
                    <Row k="Availability" v="Yes — see contact" />
                  </dl>
                </div>
              </aside>
            </div>
          )}

          {tab === 'experience' && (
            <div className="space-y-3.5 max-w-[76ch]">
              {experience.map((e, i) => (
                <motion.div
                  key={e.company}
                  className="rounded-xl p-4 panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-[14px] font-semibold">{e.role}</p>
                      <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                        {e.company} · {e.location}
                      </p>
                    </div>
                    <span className="text-[11.5px] px-2.5 py-1 rounded-full shrink-0" style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)', color: 'var(--os-text-muted)' }}>
                      {e.period}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed mt-2.5" style={{ color: 'var(--os-text-muted)' }}>
                    {e.summary}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {e.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5 text-[12.5px] leading-relaxed">
                        <StatusGlyphs.check size={14} className="mt-[3px] shrink-0" style={{ color: 'var(--os-accent)' }} />
                        <span style={{ color: 'var(--os-text-muted)' }}>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {e.stack.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)', color: 'var(--os-text-muted)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              <Block title="Education">
                {education.map((ed) => (
                  <div key={ed.school} className="rounded-xl p-4 panel">
                    <p className="text-[13.5px] font-semibold">{ed.credential}</p>
                    <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                      {ed.school} · {ed.period}
                    </p>
                    <p className="text-[12.5px] mt-2 leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                      {ed.note}
                    </p>
                  </div>
                ))}
              </Block>

              <Block title="Certifications">
                <div className="flex flex-wrap gap-2">
                  {certifications.map((c) => (
                    <span key={c.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg panel text-[12.5px]">
                      <StatusGlyphs.award size={14} style={{ color: 'var(--os-accent)' }} />
                      {c.name}
                      <span style={{ color: 'var(--os-text-muted)' }}>· {c.year}</span>
                    </span>
                  ))}
                </div>
              </Block>
            </div>
          )}

          {tab === 'skills' && (
            <div className="space-y-4">
              {skillGroups.map((g, gi) => (
                <motion.div
                  key={g.group}
                  className="rounded-xl p-4 panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.06 }}
                >
                  <p className="text-[13px] font-semibold mb-3 flex items-center gap-2">
                    <StatusGlyphs.wrench size={14} style={{ color: 'var(--os-accent)' }} />
                    {g.group}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <span key={s} className="text-[12.5px] px-3 py-1.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              <div className="rounded-xl p-4 panel">
                <p className="text-[13px] font-semibold mb-3">Working languages</p>
                <div className="space-y-2.5">
                  {[
                    { l: 'English', level: 'Professional' },
                    { l: 'Urdu', level: 'Native' },
                    { l: 'Punjabi', level: 'Conversational' },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center justify-between text-[12.5px]">
                      <span>{x.l}</span>
                      <span style={{ color: 'var(--os-text-muted)' }}>{x.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'references' && (
            <div className="grid md:grid-cols-3 gap-3.5">
              {testimonials.map((t, i) => (
                <motion.blockquote
                  key={t.name}
                  className="rounded-xl p-4 panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <p className="text-[13px] leading-[1.75]">“{t.quote}”</p>
                  <footer className="mt-3.5 pt-3" style={{ borderTop: '1px solid var(--os-border)' }}>
                    <p className="text-[12.5px] font-semibold">{t.name}</p>
                    <p className="text-[11.5px]" style={{ color: 'var(--os-text-muted)' }}>
                      {t.title}
                    </p>
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="text-[13px] font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt style={{ color: 'var(--os-text-muted)' }}>{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
