import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { profile, experience, faq, timeline } from '../../data/profile';
import { projects, gallery } from '../../data/projects';
import { posts } from '../../data/blog';
import { StatusGlyphs, AppIcon } from '../../lib/icons';
import { Img } from '../ui/Img';

const { arrowLeft: Back, arrowRight: Fwd, refresh: Reload, star: StarIcon, chevronRight: Chevron, arrowUpRight: Ext, clock: ReadClock, send: SendIcon } = StatusGlyphs;

interface Page {
  route: string;
  title: string;
  render: () => React.ReactElement;
}

export function BrowserApp({ payload }: { payload?: Record<string, unknown> }) {
  const initial = typeof payload?.route === 'string' ? payload.route : '/biography';
  const [history, setHistory] = useState<string[]>([initial]);
  const [idx, setIdx] = useState(0);
  const [starred, setStarred] = useState<string[]>(['/biography']);
  const route = history[idx];

  const pages: Page[] = useMemo(
    () => [
      { route: '/biography', title: 'Biography', render: () => <Biography onNav={go} /> },
      { route: '/work', title: 'Selected work', render: () => <WorkPage onNav={go} /> },
      { route: '/gallery', title: 'Gallery', render: () => <GalleryPage onNav={go} /> },
      { route: '/writing', title: 'Writing', render: () => <Writing onNav={go} /> },
      { route: '/contact', title: 'Contact', render: () => <ContactPage /> },
      { route: '/faq', title: 'Frequently asked questions', render: () => <Faq /> },
      { route: '/project/:id', title: 'Project', render: () => <ProjectPage onNav={go} /> },
      { route: '/writing/:slug', title: 'Post', render: () => <PostPage onNav={go} /> },
    ],
    []
  );

  function go(next: string) {
    setHistory((h) => [...h.slice(0, idx + 1), next]);
    setIdx((i) => i + 1);
  }

  const resolve = () => {
    if (route.startsWith('/project/')) {
      const id = route.split('/')[2];
      const p = projects.find((x) => x.id === id);
      if (p) return <ProjectPage id={id} onNav={go} />;
      return <NotFound onNav={go} />;
    }
    if (route.startsWith('/writing/')) {
      const slug = route.split('/')[2];
      const p = posts.find((x) => x.slug === slug);
      if (p) return <PostPage slug={slug} onNav={go} />;
      return <NotFound onNav={go} />;
    }
    const page = pages.find((p) => p.route === route);
    if (page) return page.render();
    return <NotFound onNav={go} />;
  };

  /* reset when the window is opened with a specific route from search or a shortcut */
  useEffect(() => {
    if (typeof payload?.route === 'string' && payload.route !== route) {
      setHistory([payload.route]);
      setIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload?.route]);

  const currentTitle = (() => {
    if (route.startsWith('/project/')) return projects.find((p) => p.id === route.split('/')[2])?.name ?? 'Project';
    if (route.startsWith('/writing/')) return posts.find((p) => p.slug === route.split('/')[2])?.title ?? 'Post';
    return pages.find((p) => p.route === route)?.title ?? 'Not found';
  })();

  return (
    <div className="h-full flex flex-col">
      {/* browser chrome */}
      <div className="app-toolbar gap-1.5">
        <button className="tool-btn px-2" disabled={idx === 0} style={{ opacity: idx === 0 ? 0.4 : 1 }} onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label="Back">
          <Back size={15} />
        </button>
        <button className="tool-btn px-2" disabled={idx >= history.length - 1} style={{ opacity: idx >= history.length - 1 ? 0.4 : 1 }} onClick={() => setIdx((i) => Math.min(history.length - 1, i + 1))} aria-label="Forward">
          <Fwd size={15} />
        </button>
        <button className="tool-btn px-2" onClick={() => setHistory([...history])} aria-label="Reload">
          <Reload size={14} />
        </button>

        <div
          className="flex-1 flex items-center gap-2 h-8 px-3 rounded-full min-w-0"
          style={{ background: 'color-mix(in srgb, var(--os-text) 6%, transparent)', border: '1px solid var(--os-border)' }}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#4f9d5a' }} />
          <span className="text-[12px] truncate" style={{ color: 'var(--os-text-muted)' }}>
            rayan.os{route.startsWith('/') ? route : `/${route}`}
          </span>
        </div>

        <button
          className={`tool-btn px-2 ${starred.includes(route) ? 'tool-btn--on' : ''}`}
          onClick={() => setStarred((s) => (s.includes(route) ? s.filter((x) => x !== route) : [...s, route]))}
          aria-label="Bookmark"
        >
          <StarIcon size={14} fill={starred.includes(route) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 px-2.5 pt-1.5 pb-0 overflow-x-auto shrink-0" style={{ borderBottom: '1px solid var(--os-border)' }}>
        {['/biography', '/work', '/writing', '/gallery', '/contact'].map((r) => {
          const label = pages.find((p) => p.route === r)?.title ?? r;
          const active = route === r || (r === '/work' && route.startsWith('/project/')) || (r === '/writing' && route.startsWith('/writing/'));
          return (
            <button
              key={r}
              className="px-3 py-1.5 rounded-t-lg text-[12px] whitespace-nowrap transition-colors max-w-[200px] truncate"
              style={{
                background: active ? 'color-mix(in srgb, var(--os-surface) 92%, transparent)' : 'transparent',
                color: active ? 'var(--os-text)' : 'var(--os-text-muted)',
                borderTop: active ? '1px solid var(--os-border)' : '1px solid transparent',
                borderLeft: active ? '1px solid var(--os-border)' : '1px solid transparent',
                borderRight: active ? '1px solid var(--os-border)' : '1px solid transparent',
              }}
              onClick={() => go(r)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* page */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.24 }}
          >
            {resolve()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="shrink-0 flex items-center justify-between px-4 h-7 text-[11px]"
        style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}
      >
        <span>{currentTitle}</span>
        <span>Rendered in RayanOS · no network requests</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

type Nav = (route: string) => void;

function Hero({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <header
      className="px-7 pt-7 pb-6"
      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--os-accent) 13%, transparent), transparent 68%)', borderBottom: '1px solid var(--os-border)' }}
    >
      <p className="text-[11px] uppercase tracking-[0.17em]" style={{ color: 'var(--os-text-muted)' }}>
        {eyebrow}
      </p>
      <h1 className="text-[26px] font-semibold mt-1.5 leading-tight">{title}</h1>
      <p className="text-[13.5px] mt-2.5 max-w-[74ch] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
        {lede}
      </p>
    </header>
  );
}

function Biography({ onNav }: { onNav: Nav }) {
  return (
    <div>
      <Hero eyebrow="Official identity and work" title={profile.name} lede={profile.tagline} />

      <div className="px-7 py-6 grid lg:grid-cols-[1.6fr_1fr] gap-7">
        <article className="max-w-[72ch]">
          {profile.longBio.map((p, i) => (
            <p key={i} className="text-[14px] leading-[1.85] mb-4" style={{ color: i === 0 ? 'var(--os-text)' : 'var(--os-text-muted)' }}>
              {p}
            </p>
          ))}

          <h2 className="text-[15px] font-semibold mt-7 mb-3">What I am working on now</h2>
          <p className="text-[13.5px] leading-[1.8]" style={{ color: 'var(--os-text-muted)' }}>
            {profile.currentFocus}
          </p>

          <h2 className="text-[15px] font-semibold mt-7 mb-3">Principles</h2>
          <div className="space-y-3.5">
            {profile.values.map((v) => (
              <div key={v.title} className="rounded-xl p-4 panel">
                <p className="text-[13px] font-semibold">{v.title}</p>
                <p className="text-[13px] leading-relaxed mt-1" style={{ color: 'var(--os-text-muted)' }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-[15px] font-semibold mt-7 mb-3">Career</h2>
          <div className="relative pl-5">
            <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px" style={{ background: 'var(--os-border-strong)' }} />
            {experience.map((e) => (
              <div key={e.company} className="relative pb-4 last:pb-0">
                <span className="absolute -left-5 top-[6px] w-2.5 h-2.5 rounded-full" style={{ background: 'var(--os-accent)' }} />
                <p className="text-[13px] font-semibold">
                  {e.role} <span style={{ color: 'var(--os-text-muted)' }}>· {e.company}</span>
                </p>
                <p className="text-[11.5px] tabular-nums" style={{ color: 'var(--os-text-muted)' }}>
                  {e.period} · {e.location}
                </p>
                <p className="text-[12.5px] leading-relaxed mt-1" style={{ color: 'var(--os-text-muted)' }}>
                  {e.summary}
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-[15px] font-semibold mt-7 mb-3">Timeline</h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {timeline.map((t) => (
              <div key={t.year} className="flex gap-3 text-[12.5px]">
                <span className="font-semibold tabular-nums shrink-0 w-11" style={{ color: 'var(--os-accent)' }}>
                  {t.year}
                </span>
                <span style={{ color: 'var(--os-text-muted)' }}>{t.text}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <Img
            src="./images/profile/rayan-malik-portrait.jpg"
            alt={`${profile.name}, ${profile.role} in ${profile.location}`}
            className="w-full rounded-xl object-cover"
            style={{ maxHeight: 380 }}
          />

          <div className="rounded-xl p-4 panel">
            <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
              Official source
            </p>
            <dl className="space-y-2.5 text-[12.5px]">
              <Field k="Based in" v={profile.location} />
              <Field k="Role" v={`${profile.role} & ${profile.roleSecondary}`} />
              <Field k="Known for" v="Cadence and Trellis" />
              <Field k="Availability" v="Yes" />
            </dl>
            <button
              className="mt-3.5 w-full h-9 rounded-lg text-[12.5px] font-medium text-white"
              style={{ background: 'var(--os-accent)' }}
              onClick={() => onNav('/contact')}
            >
              Get in touch
            </button>
          </div>

          <div className="rounded-xl p-4 panel">
            <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
              Profiles
            </p>
            <div className="space-y-1">
              {profile.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-white/5"
                >
                  <span>{s.label}</span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--os-text-muted)' }}>
                    {s.handle} <Ext size={11} />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 panel">
            <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
              Continue reading
            </p>
            {[
              { r: '/work', l: 'Selected work' },
              { r: '/writing', l: 'Writing' },
              { r: '/gallery', l: 'Gallery' },
              { r: '/faq', l: 'Questions' },
            ].map((x) => (
              <button key={x.r} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-white/5" onClick={() => onNav(x.r)}>
                {x.l} <Chevron size={13} style={{ color: 'var(--os-text-muted)' }} />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function WorkPage({ onNav }: { onNav: Nav }) {
  return (
    <div>
      <Hero eyebrow="Selected work" title="Eight projects, start to finish" lede="Each case study covers the problem, the approach and what measurably changed. No mood boards without an outcome." />
      <div className="px-7 py-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <motion.button
            key={p.id}
            className="text-left rounded-xl overflow-hidden panel card-hover"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onNav(`/project/${p.id}`)}
          >
            <Img src={`./images/projects/${p.image}`} alt={p.tagline} loading="lazy" className="w-full h-[132px] object-cover" />
            <span className="block p-3.5">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold">{p.name}</span>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full text-white" style={{ background: p.accent }}>
                  {p.kind}
                </span>
              </span>
              <span className="block text-[12.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                {p.tagline}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ProjectPage({ id, onNav }: { id?: string; onNav: Nav }) {
  const p = projects.find((x) => x.id === id);
  if (!p) return <NotFound onNav={onNav} />;
  return (
    <article>
      <Img src={`./images/projects/${p.image}`} alt={p.tagline} className="w-full h-[220px] object-cover" />
      <div className="px-7 py-6 max-w-[76ch]">
        <button className="text-[12px] flex items-center gap-1.5 mb-3" style={{ color: 'var(--os-text-muted)' }} onClick={() => onNav('/work')}>
          <Back size={13} /> All work
        </button>
        <h1 className="text-[24px] font-semibold leading-tight">{p.name}</h1>
        <p className="text-[13.5px] mt-1.5" style={{ color: 'var(--os-text-muted)' }}>
          {p.tagline}
        </p>

        <div className="grid sm:grid-cols-3 gap-2.5 mt-5">
          {[
            { k: 'Role', v: p.role },
            { k: 'Period', v: p.year },
            { k: 'Category', v: p.kind },
          ].map((r) => (
            <div key={r.k} className="rounded-lg p-3 panel">
              <p className="text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
                {r.k}
              </p>
              <p className="text-[12.5px] font-medium mt-1">{r.v}</p>
            </div>
          ))}
        </div>

        <h2 className="text-[15px] font-semibold mt-6 mb-2">Summary</h2>
        <p className="text-[14px] leading-[1.85]">{p.summary}</p>

        <h2 className="text-[15px] font-semibold mt-6 mb-2">The problem</h2>
        <p className="text-[13.5px] leading-[1.8]" style={{ color: 'var(--os-text-muted)' }}>
          {p.problem}
        </p>

        <h2 className="text-[15px] font-semibold mt-6 mb-2">What I did</h2>
        <ul className="space-y-2.5">
          {p.approach.map((a) => (
            <li key={a} className="flex gap-3 text-[13.5px] leading-[1.75]" style={{ color: 'var(--os-text-muted)' }}>
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.accent }} />
              {a}
            </li>
          ))}
        </ul>

        <h2 className="text-[15px] font-semibold mt-6 mb-2">What changed</h2>
        <ul className="space-y-2.5">
          {p.outcome.map((o) => (
            <li key={o} className="flex gap-3 text-[13.5px] leading-[1.75]">
              <StatusGlyphs.check size={15} className="mt-[4px] shrink-0" style={{ color: 'var(--os-accent)' }} />
              <span style={{ color: 'var(--os-text-muted)' }}>{o}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-[15px] font-semibold mt-6 mb-2.5">Stack</h2>
        <div className="flex flex-wrap gap-2">
          {p.stack.map((s) => (
            <span key={s} className="text-[12px] px-3 py-1.5 rounded-full panel">
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function GalleryPage({ onNav }: { onNav: Nav }) {
  return (
    <div>
      <Hero eyebrow="Gallery" title="Places, desks and prototypes" lede="Photographs from the studio, talks and the odd rooftop. All original, no stock." />
      <div className="px-7 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map((g) => (
          <figure key={g.id} className="rounded-xl overflow-hidden panel">
            <Img src={`./images/gallery/${g.file}`} alt={g.caption} loading="lazy" className="w-full h-[186px] object-cover" />
            <figcaption className="p-3.5">
              <p className="text-[12.5px] leading-relaxed">{g.caption}</p>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--os-text-muted)' }}>
                {g.place} · {g.year}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Writing({ onNav }: { onNav: Nav }) {
  return (
    <div>
      <Hero eyebrow="Writing" title="Notes on interface decisions" lede="Short essays about the parts of product work nobody notices until they are wrong." />
      <div className="px-7 py-6 max-w-[80ch] space-y-3.5">
        {posts.map((p, i) => (
          <motion.button
            key={p.slug}
            className="w-full text-left rounded-xl p-4 panel card-hover"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onNav(`/writing/${p.slug}`)}
          >
            <span className="flex items-center gap-2.5 text-[11px] mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
              <StatusGlyphs.calendar size={12} />
              {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              <span>·</span>
              <ReadClock size={12} />
              {p.readTime}
            </span>
            <span className="block text-[15px] font-semibold">{p.title}</span>
            <span className="block text-[13px] mt-1.5 leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
              {p.excerpt}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function PostPage({ slug, onNav }: { slug?: string; onNav: Nav }) {
  const p = posts.find((x) => x.slug === slug);
  if (!p) return <NotFound onNav={onNav} />;
  return (
    <article className="px-7 py-7 max-w-[74ch]">
      <button className="text-[12px] flex items-center gap-1.5 mb-3" style={{ color: 'var(--os-text-muted)' }} onClick={() => onNav('/writing')}>
        <Back size={13} /> All writing
      </button>
      <h1 className="text-[25px] font-semibold leading-tight">{p.title}</h1>
      <div className="flex items-center gap-2.5 text-[11.5px] mt-2.5 mb-5" style={{ color: 'var(--os-text-muted)' }}>
        <span>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>·</span>
        <span>{p.readTime}</span>
      </div>
      {p.body.map((para, i) => (
        <p key={i} className="text-[14px] leading-[1.9] mb-4" style={{ color: i === 0 ? 'var(--os-text)' : 'var(--os-text-muted)' }}>
          {para}
        </p>
      ))}
      <div className="flex flex-wrap gap-2 mt-6">
        {p.tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

function ContactPage() {
  const pushToast = useOS((s) => s.pushToast);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Project enquiry', message: '' });
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!form.name || !form.email || !form.message) {
      pushToast({ appId: 'browser', title: 'Missing fields', body: 'Name, email and a message are needed before sending.' });
      return;
    }
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(form.subject)}&body=${body}`;
    setSent(true);
    pushToast({ appId: 'browser', title: 'Opening your mail client', body: 'The message is pre-filled — review it and hit send.' });
  };

  return (
    <div>
      <Hero eyebrow="Contact" title="Start a conversation" lede={profile.availability} />
      <div className="px-7 py-6 grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="rounded-xl p-5 panel">
          <div className="grid sm:grid-cols-2 gap-3">
            <Labeled label="Your name">
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ayesha Khan" />
            </Labeled>
            <Labeled label="Your email">
              <input className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
            </Labeled>
          </div>
          <Labeled label="Subject">
            <select className="field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {['Project enquiry', 'Full-time role', 'Speaking or workshop', 'Something else'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Message">
            <textarea
              className="field"
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What are you building, and where does the interface hurt?"
            />
          </Labeled>
          <button
            className="mt-3 h-10 px-5 rounded-lg text-[13px] font-medium text-white flex items-center gap-2"
            style={{ background: 'var(--os-accent)' }}
            onClick={send}
          >
            {sent ? <StatusGlyphs.check size={15} /> : <SendIcon size={15} />}
            {sent ? 'Sent — check your mail client' : 'Send message'}
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl p-4 panel">
            <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
              Direct
            </p>
            <a className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] hover:bg-white/5" href={`mailto:${profile.email}`}>
              <StatusGlyphs.mail size={15} /> {profile.email}
            </a>
            <a className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] hover:bg-white/5" href="tel:+923000000000">
              <StatusGlyphs.clock size={15} /> {profile.phone}
            </a>
            <div className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px]" style={{ color: 'var(--os-text-muted)' }}>
              <StatusGlyphs.pin size={15} /> {profile.location}
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
                {s.label}
                <Ext size={11} style={{ color: 'var(--os-text-muted)' }} />
              </a>
            ))}
          </div>

          <div className="rounded-xl p-4 panel">
            <p className="text-[12.5px] font-semibold mb-1.5">Response time</p>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
              Usually within a working day, {profile.timezone}. If it is urgent, say so in the subject line.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <Hero eyebrow="Questions" title="Frequently asked" lede="The short answers, including how this portfolio was built." />
      <div className="px-7 py-6 max-w-[78ch] space-y-2.5">
        {faq.map((f, i) => (
          <div key={f.q} className="rounded-xl panel overflow-hidden">
            <button className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left" onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-[13.5px] font-medium">{f.q}</span>
              <Chevron size={15} style={{ transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform .2s', color: 'var(--os-text-muted)' }} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                  <p className="px-4 pb-4 text-[13px] leading-[1.8]" style={{ color: 'var(--os-text-muted)' }}>
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFound({ onNav }: { onNav: Nav }) {
  return (
    <div className="grid place-items-center py-20 px-7 text-center">
      <AppIcon id="browser" size={54} radius={15} />
      <h2 className="text-[20px] font-semibold mt-4">This page is not in the build</h2>
      <p className="text-[13px] mt-2 max-w-[48ch]" style={{ color: 'var(--os-text-muted)' }}>
        The route exists so links never break, but there is no content behind it yet. Try the biography or the work section.
      </p>
      <div className="flex gap-2 mt-4">
        <button className="chip" onClick={() => onNav('/biography')}>
          Biography
        </button>
        <button className="chip" onClick={() => onNav('/work')}>
          Selected work
        </button>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt style={{ color: 'var(--os-text-muted)' }}>{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-[11.5px] mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}
