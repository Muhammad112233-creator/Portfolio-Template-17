import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects, projectFilters, type Project } from '../../data/projects';
import { StatusGlyphs } from '../../lib/icons';
import { Img } from '../ui/Img';

const { filter: FilterIcon, listView: ListIcon, gridView: GridIcon, arrowLeft: BackIcon, arrowUpRight: ExtIcon, copy: CopyIcon, check: CheckIcon } = StatusGlyphs;

export function WorkbenchApp({ payload }: { payload?: Record<string, unknown> }) {
  const initial = typeof payload?.projectId === 'string' ? payload.projectId : null;
  const [active, setActive] = useState<string | null>(initial);
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'recent' | 'name'>('recent');

  const list = useMemo(() => {
    let out = projects.filter((p) => filter === 'All' || p.kind === filter);
    if (sort === 'name') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else out = [...out].sort((a, b) => b.year.localeCompare(a.year));
    return out;
  }, [filter, sort]);

  const project = projects.find((p) => p.id === active);

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        {project ? (
          <button className="tool-btn" onClick={() => setActive(null)}>
            <BackIcon size={15} /> All projects
          </button>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-[12px] pl-1" style={{ color: 'var(--os-text-muted)' }}>
              <FilterIcon size={13} /> Filter
            </span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {projectFilters.map((f) => (
                <button
                  key={f}
                  className={`tool-btn whitespace-nowrap ${filter === f ? 'tool-btn--on' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="flex-1" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'name')}
              className="h-8 px-2 rounded-md text-[12px] outline-none"
              style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)', border: '1px solid var(--os-border)' }}
              aria-label="Sort projects"
            >
              <option value="recent">Most recent</option>
              <option value="name">Name A–Z</option>
            </select>
            <button
              className="tool-btn"
              onClick={() => setView((v) => (v === 'grid' ? 'list' : 'grid'))}
              title={view === 'grid' ? 'Switch to list' : 'Switch to grid'}
            >
              {view === 'grid' ? <ListIcon size={15} /> : <GridIcon size={15} />}
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {project ? (
            <Detail key="detail" project={project} />
          ) : view === 'grid' ? (
            <motion.div
              key={`grid-${filter}-${sort}`}
              className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              {list.map((p, i) => (
                <motion.button
                  key={p.id}
                  className="text-left rounded-xl overflow-hidden panel card-hover"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.035, 0.3), type: 'spring', stiffness: 380, damping: 30 }}
                  onClick={() => setActive(p.id)}
                >
                  <span className="block relative">
                    <Img src={`./images/projects/${p.image}`} alt={`${p.name} — ${p.tagline}`} className="w-full h-[128px] object-cover" loading="lazy" />
                    <span
                      className="absolute top-2 left-2 text-[10.5px] px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ background: p.accent }}
                    >
                      {p.kind}
                    </span>
                  </span>
                  <span className="block p-3.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[14px] font-semibold truncate">{p.name}</span>
                      <span className="text-[11px] shrink-0" style={{ color: 'var(--os-text-muted)' }}>
                        {p.year}
                      </span>
                    </span>
                    <span className="block text-[12px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--os-text-muted)' }}>
                      {p.tagline}
                    </span>
                    <span className="flex flex-wrap gap-1.5 mt-2.5">
                      {p.stack.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--os-text) 8%, transparent)', color: 'var(--os-text-muted)' }}>
                          {t}
                        </span>
                      ))}
                    </span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`list-${filter}-${sort}`}
              className="p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              {list.map((p, i) => (
                <button
                  key={p.id}
                  className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-white/5"
                  onClick={() => setActive(p.id)}
                >
                  <Img src={`./images/projects/${p.image}`} alt="" width={76} height={48} className="w-[76px] h-[48px] rounded-md object-cover shrink-0" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{p.name}</span>
                    <span className="block text-[11.5px] truncate" style={{ color: 'var(--os-text-muted)' }}>
                      {p.tagline}
                    </span>
                  </span>
                  <span className="hidden sm:block text-[11px] shrink-0" style={{ color: 'var(--os-text-muted)' }}>
                    {p.kind}
                  </span>
                  <span className="text-[11px] shrink-0 tabular-nums" style={{ color: 'var(--os-text-muted)' }}>
                    {p.year}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]"
        style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}
      >
        <span>{list.length} projects</span>
        <span>{filter === 'All' ? 'Every category' : filter}</span>
      </div>
    </div>
  );
}

function Detail({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/projects/${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.14 } }}
      transition={{ duration: 0.26 }}
      className="pb-6"
    >
      <div className="relative">
        <Img src={`./images/projects/${project.image}`} alt={project.tagline} className="w-full h-[210px] object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 24%, rgba(6,9,18,.86) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10.5px] px-2 py-0.5 rounded-full font-medium text-white" style={{ background: project.accent }}>
              {project.kind}
            </span>
            <h2 className="text-[24px] font-semibold text-white mt-2 leading-tight">{project.name}</h2>
            <p className="text-[12.5px] text-white/80 mt-1 max-w-[70ch]">{project.tagline}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              className="h-9 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,.16)', color: '#fff', backdropFilter: 'blur(8px)' }}
              onClick={share}
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            {project.link && (
              <a
                className="h-9 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,.16)', color: '#fff', backdropFilter: 'blur(8px)' }}
                href={project.link}
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExtIcon size={14} /> Visit
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div>
          <p className="text-[14px] leading-[1.8]">{project.summary}</p>

          <Section title="The problem">
            <p className="text-[13.5px] leading-[1.8]" style={{ color: 'var(--os-text-muted)' }}>
              {project.problem}
            </p>
          </Section>

          <Section title="What I did">
            <ul className="space-y-2.5">
              {project.approach.map((a) => (
                <li key={a} className="flex gap-3 text-[13.5px] leading-[1.75]" style={{ color: 'var(--os-text-muted)' }}>
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: project.accent }} />
                  {a}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="What changed">
            <div className="grid sm:grid-cols-3 gap-3">
              {project.outcome.map((o) => (
                <div key={o} className="rounded-xl p-3.5 panel">
                  <p className="text-[12.5px] leading-relaxed">{o}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl p-4 panel">
            <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
              Details
            </p>
            <dl className="space-y-2.5 text-[12.5px]">
              <Row k="Role" v={project.role} />
              <Row k="Period" v={project.year} />
              <Row k="Category" v={project.kind} />
            </dl>
          </div>

          <div className="rounded-xl p-4 panel">
            <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--os-text-muted)' }}>
              Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((t) => (
                <span key={t} className="text-[11.5px] px-2.5 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--os-text) 8%, transparent)', color: 'var(--os-text-muted)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </motion.article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-[13px] font-semibold mb-2.5">{title}</h3>
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
