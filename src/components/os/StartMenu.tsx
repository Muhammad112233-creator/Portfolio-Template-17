import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store/os';
import { APPS, pinnedApps, appById } from '../../data/apps';
import { AppIcon, StatusGlyphs } from '../../lib/icons';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import { posts } from '../../data/blog';
import { useClickOutside } from '../../hooks/useShell';

const { search: SearchIcon, chevronRight: Chevron, power: PowerIcon, refresh: RestartIcon, moon: SleepIcon, github: GithubIcon } = StatusGlyphs;

export function StartMenu() {
  const startOpen = useOS((s) => s.startOpen);
  const closeAll = useOS((s) => s.closeAllFlyouts);
  const openApp = useOS((s) => s.openApp);
  const toggleSearch = useOS((s) => s.toggleSearch);
  const setPhase = useOS((s) => s.setPhase);
  const [showAll, setShowAll] = useState(false);

  const ref = useClickOutside<HTMLDivElement>(closeAll, startOpen);

  const recommended = useMemo(
    () => [
      { id: 'rec-resume', appId: 'resume' as const, title: 'resume.pdf', sub: 'Experience, skills and education', kind: 'doc' },
      { id: 'rec-cadence', appId: 'works' as const, title: 'cadence.md', sub: 'Design system case study', kind: 'code' },
      { id: 'rec-trellis', appId: 'works' as const, title: 'trellis.md', sub: 'Preview engine case study', kind: 'code' },
      { id: 'rec-bio', appId: 'browser' as const, title: 'biography.html', sub: 'The long version', kind: 'doc' },
      { id: 'rec-jank', appId: 'browser' as const, title: 'measuring-jank.md', sub: 'Latest post', kind: 'doc' },
      { id: 'rec-gallery', appId: 'gallery' as const, title: 'studio-2026/', sub: 'Twelve photos', kind: 'image' },
    ],
    []
  );

  const launch = (appId: Parameters<typeof openApp>[0], title?: string, payload?: Record<string, unknown>) => {
    openApp(appId, payload, title);
  };

  const list = showAll ? APPS : pinnedApps;

  return (
    <AnimatePresence>
      {startOpen && (
        <motion.div
          ref={ref}
          className="start-menu"
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.99, transition: { duration: 0.14 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          role="dialog"
          aria-label="Start menu"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* search bar */}
          <div className="p-5 pb-3">
            <button
              className="w-full h-10 rounded-full flex items-center gap-3 px-4 text-sm text-left"
              style={{
                background: 'color-mix(in srgb, var(--os-text) 7%, transparent)',
                border: '1px solid var(--os-border)',
                color: 'var(--os-text-muted)',
              }}
              onClick={() => {
                closeAll();
                toggleSearch(true);
              }}
            >
              <SearchIcon size={16} strokeWidth={1.8} />
              <span>Search apps, files and pages</span>
            </button>
          </div>

          <div className="px-5 flex items-center justify-between pb-2">
            <span className="text-[13px] font-semibold">{showAll ? 'All apps' : 'Pinned'}</span>
            <button
              className="text-[12px] px-2.5 py-1 rounded-md transition-colors"
              style={{ color: 'var(--os-text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--os-text) 8%, transparent)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Back' : 'All apps'}
            </button>
          </div>

          {/* app area */}
          <div className="px-4 overflow-y-auto" style={{ maxHeight: 320 }}>
            {showAll ? (
              <div className="flex flex-col gap-0.5 pb-2">
                {APPS.map((a, i) => (
                  <motion.button
                    key={a.id}
                    className="sm-row"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.016 }}
                    onClick={() => launch(a.id, a.name)}
                  >
                    <AppIcon id={a.id} size={30} radius={8} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium truncate">{a.name}</span>
                      <span className="block text-[11.5px] truncate" style={{ color: 'var(--os-text-muted)' }}>
                        {a.subtitle}
                      </span>
                    </span>
                    <Chevron size={14} style={{ color: 'var(--os-text-muted)' }} />
                  </motion.button>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 pb-3">
                  {list.map((a, i) => (
                    <motion.button
                      key={a.id}
                      className="sm-tile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.022, type: 'spring', stiffness: 460, damping: 30 }}
                      onClick={() => launch(a.id, a.name)}
                      title={a.blurb}
                    >
                      <AppIcon id={a.id} size={38} radius={10} />
                      <span className="line-clamp-2 leading-tight">{a.name}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center justify-between pb-2 pt-1">
                  <span className="text-[13px] font-semibold">Recommended</span>
                  <Chevron size={13} style={{ color: 'var(--os-text-muted)' }} />
                </div>
                <div className="grid sm:grid-cols-2 gap-1 pb-3">
                  {recommended.map((r) => (
                    <button
                      key={r.id}
                      className="sm-row"
                      onClick={() =>
                        launch(
                          r.appId,
                          r.title,
                          r.appId === 'browser' && r.title.startsWith('measuring')
                            ? { route: `/blog/${posts[1].slug}` }
                            : r.appId === 'browser' && r.title.startsWith('biography')
                              ? { route: '/biography' }
                              : r.appId === 'works'
                                ? { projectId: r.title.split('.')[0] }
                                : undefined
                        )
                      }
                    >
                      <AppIcon id={r.appId} size={28} radius={7} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12.5px] font-medium truncate">{r.title}</span>
                        <span className="block text-[11px] truncate" style={{ color: 'var(--os-text-muted)' }}>
                          {r.sub}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* footer */}
          <div
            className="mt-auto flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid var(--os-border)', background: 'color-mix(in srgb, var(--os-text) 4%, transparent)' }}
          >
            <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-md -ml-2" onClick={() => launch('contact', 'Contact')}>
              <span
                className="grid place-items-center rounded-full text-[12px] font-semibold text-white"
                style={{ width: 30, height: 30, background: 'linear-gradient(140deg,#7cb3ff,var(--os-accent))' }}
              >
                RM
              </span>
              <span className="text-[12.5px] font-medium">{profile.name}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                className="tb-btn"
                title="Restart RayanOS"
                aria-label="Restart"
                onClick={() => {
                  closeAll();
                  setPhase('boot');
                }}
              >
                <RestartIcon size={16} strokeWidth={1.7} />
              </button>
              <button
                className="tb-btn"
                title="Sleep"
                aria-label="Sleep"
                onClick={() => {
                  closeAll();
                  setPhase('sleeping');
                }}
              >
                <SleepIcon size={16} strokeWidth={1.7} />
              </button>
              <button
                className="tb-btn"
                title="Shut down"
                aria-label="Shut down"
                onClick={() => {
                  closeAll();
                  setPhase('shutdown');
                }}
              >
                <PowerIcon size={16} strokeWidth={1.7} />
              </button>
              <a
                className="tb-btn"
                title="Source on GitHub"
                aria-label="Source on GitHub"
                href="https://github.com/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <GithubIcon size={16} strokeWidth={1.7} />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* keep the registry import in the bundle for tree-shaking hints */
export const __apps = appById;
