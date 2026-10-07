import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { profile, experience, skillGroups } from '../../data/profile';
import { StatusGlyphs, AppIcon } from '../../lib/icons';

const { copy: CopyIcon, check: CheckIcon, send: SendIcon, arrowUpRight: Ext, mail: MailIcon } = StatusGlyphs;

const TOPICS = [
  'Product engineering role',
  'Design system contract',
  'Interface audit',
  'Speaking or workshop',
  'Just saying hello',
];

export function ContactApp() {
  const pushToast = useOS((s) => s.pushToast);
  const openApp = useOS((s) => s.openApp);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    topic: TOPICS[0],
    budget: '',
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const valid = form.name.trim().length > 1 && /.+@.+\..+/.test(form.email) && form.message.trim().length > 9;

  const send = () => {
    if (!valid) {
      pushToast({ appId: 'contact', title: 'Almost there', body: 'A name, a working email and at least a sentence are required.' });
      return;
    }
    const body = [
      form.message,
      '',
      '—',
      `Name:    ${form.name}`,
      `Email:   ${form.email}`,
      form.company ? `Company: ${form.company}` : '',
      `Topic:   ${form.topic}`,
      form.budget ? `Budget:  ${form.budget}` : '',
      `Sent from RayanOS (interactive desktop portfolio)`,
    ]
      .filter(Boolean)
      .join('\n');

    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
      `[${form.topic}] ${form.name}`
    )}&body=${encodeURIComponent(body)}`;

    setSent(true);
    pushToast({ appId: 'contact', title: 'Mail client opened', body: 'Your message is pre-filled and ready to send.' });
  };

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      pushToast({ appId: 'contact', title: 'Clipboard blocked', body: 'Select the text and copy it manually.' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <AppIcon id="contact" size={18} radius={5} />
        <span className="text-[12.5px] font-medium">Start a conversation</span>
        <span className="flex-1" />
        <button className="tool-btn" onClick={() => openApp('resume', undefined, 'Resume')}>
          <StatusGlyphs.fileText size={14} /> View resume
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          {/* form */}
          <div className="p-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26 }}>
              <h2 className="text-[21px] font-semibold leading-tight">Tell me what you are building</h2>
              <p className="text-[13px] mt-2 max-w-[58ch] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                {profile.availability}. The more specific you are about the problem, the more useful my first reply
                will be.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <Field label="Your name" required>
                  <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ayesha Khan" />
                </Field>
                <Field label="Email" required>
                  <input className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
                </Field>
                <Field label="Company or project">
                  <input className="field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Optional" />
                </Field>
                <Field label="Budget range">
                  <input className="field" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Optional, but useful" />
                </Field>
              </div>

              <Field label="What is this about">
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      className="chip"
                      style={
                        form.topic === t
                          ? { borderColor: 'var(--os-accent)', color: 'var(--os-accent)', background: 'var(--os-accent-soft)' }
                          : undefined
                      }
                      onClick={() => setForm({ ...form, topic: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Message" required>
                <textarea
                  className="field"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What are you building? Where does the interface hurt? What have you already tried?"
                />
              </Field>

              <div className="flex items-center gap-3 mt-1">
                <button
                  className="h-10 px-5 rounded-lg text-[13px] font-medium text-white flex items-center gap-2 transition-transform disabled:opacity-45"
                  style={{ background: 'var(--os-accent)', transform: valid ? 'none' : 'none' }}
                  onClick={send}
                >
                  {sent ? <CheckIcon size={15} /> : <SendIcon size={15} />}
                  {sent ? 'Sent' : 'Send message'}
                </button>
                <span className="text-[11.5px]" style={{ color: 'var(--os-text-muted)' }}>
                  {valid ? 'Ready to open in your mail client' : 'Name, email and a message required'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* sidebar */}
          <aside className="p-5 space-y-4 border-l" style={{ borderColor: 'var(--os-border)' }}>
            <div className="rounded-xl p-4 panel">
              <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
                Direct
              </p>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] hover:bg-white/5" onClick={() => copy(profile.email, 'email')}>
                <MailIcon size={15} />
                <span className="flex-1 text-left truncate">{profile.email}</span>
                {copied === 'email' ? <CheckIcon size={13} style={{ color: 'var(--os-accent)' }} /> : <CopyIcon size={13} className="opacity-60" />}
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] hover:bg-white/5" onClick={() => copy(profile.phone, 'phone')}>
                <StatusGlyphs.clock size={15} />
                <span className="flex-1 text-left truncate">{profile.phone}</span>
                {copied === 'phone' ? <CheckIcon size={13} style={{ color: 'var(--os-accent)' }} /> : <CopyIcon size={13} className="opacity-60" />}
              </button>
              <div className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px]" style={{ color: 'var(--os-text-muted)' }}>
                <StatusGlyphs.pin size={15} /> {profile.location} · {profile.timezone}
              </div>
            </div>

            <div className="rounded-xl p-4 panel">
              <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
                Elsewhere
              </p>
              {profile.socials.map((s) => (
                <a
                  key={s.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-white/5"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span>{s.label}</span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--os-text-muted)' }}>
                    {s.handle}
                    <Ext size={11} />
                  </span>
                </a>
              ))}
            </div>

            <div className="rounded-xl p-4 panel">
              <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
                What I am good at
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skillGroups[0].items.slice(0, 8).map((s) => (
                  <span key={s} className="text-[11.5px] px-2.5 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)' }}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[12px] mt-3 leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                Currently {experience[0].role.toLowerCase()} at {experience[0].company}.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]" style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}>
        <span>Replies usually within one working day</span>
        <span>No tracking, no newsletter</span>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-[11.5px] mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
        {label}
        {required && <span style={{ color: 'var(--os-accent)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}
