import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { AppIcon, StatusGlyphs } from '../../lib/icons';

const { star: StarIcon, download: GetIcon, check: DoneIcon, plus: PlusIcon } = StatusGlyphs;

interface Listing {
  id: string;
  name: string;
  publisher: string;
  category: 'Recreation' | 'Productivity' | 'Developer tools' | 'Personalisation';
  rating: number;
  reviews: string;
  size: string;
  blurb: string;
  installable: boolean;
  app?: string;
  icon?: string;
}

const LISTINGS: Listing[] = [
  {
    id: 'sound-lab',
    name: 'Sound Lab',
    publisher: 'Studio Meridian',
    category: 'Recreation',
    rating: 4.8,
    reviews: '1.2K',
    size: '0 KB',
    blurb: 'A generative ambient synthesizer built on the Web Audio API. No audio files, four voices, three presets.',
    installable: false,
    app: 'studio',
  },
  {
    id: 'wormhole',
    name: 'Wormhole',
    publisher: 'Studio Meridian',
    category: 'Recreation',
    rating: 5,
    reviews: '318',
    size: '4 KB',
    blurb: 'The grid game from 1976, rewritten with keyboard support and a slightly better death animation.',
    installable: false,
    app: 'snake',
  },
  {
    id: 'memory-wall',
    name: 'Memory Wall',
    publisher: 'Studio Meridian',
    category: 'Recreation',
    rating: 4.6,
    reviews: '92',
    size: '2 KB',
    blurb: 'A public corkboard. Leave a note for the next visitor; it saves locally and stays put.',
    installable: false,
    app: 'wall',
  },
  {
    id: 'terminal-pro',
    name: 'Shell Extras',
    publisher: 'RayanOS',
    category: 'Developer tools',
    rating: 4.9,
    reviews: '2.4K',
    size: '18 KB',
    blurb: 'Adds twenty-six commands to the terminal, including theme, accent, wallpaper and window controllers.',
    installable: false,
    app: 'terminal',
  },
  {
    id: 'tokens',
    name: 'Cadence Tokens',
    publisher: 'Studio Meridian',
    category: 'Developer tools',
    rating: 4.7,
    reviews: '641',
    size: '36 KB',
    blurb: 'A live view of the design token pipeline described in the Cadence case study. Exports CSS and JSON.',
    installable: true,
    icon: 'works',
  },
  {
    id: 'atlas',
    name: 'Atlas Type',
    publisher: 'Studio Meridian',
    category: 'Productivity',
    rating: 4.8,
    reviews: '204',
    size: '112 KB',
    blurb: 'Variable-font specimen tool. Drag the axes, pin up to four instances, export a specimen sheet.',
    installable: true,
    icon: 'works',
  },
  {
    id: 'wallpapers-pack',
    name: 'Wallpaper Pack: Monsoon',
    publisher: 'RayanOS',
    category: 'Personalisation',
    rating: 4.5,
    reviews: '3.1K',
    size: '8 MB',
    blurb: 'Six additional backgrounds shot in Lahore during the monsoon. Adds to the Personalisation settings page.',
    installable: true,
    icon: 'settings',
  },
  {
    id: 'focus',
    name: 'Quiet Hours',
    publisher: 'Studio Meridian',
    category: 'Productivity',
    rating: 4.9,
    reviews: '9.3K',
    size: '6 KB',
    blurb: 'Six hundred lines, no account, no analytics. It dims the screen and counts down.',
    installable: true,
    icon: 'welcome',
  },
];

export function StoreApp() {
  const [category, setCategory] = useState<'All' | Listing['category']>('All');
  const [installed, setInstalled] = useState<string[]>(['terminal-pro']);
  const [installing, setInstalling] = useState<Record<string, number>>({});
  const pushToast = useOS((s) => s.pushToast);
  const openApp = useOS((s) => s.openApp);

  const list = LISTINGS.filter((l) => category === 'All' || l.category === category);

  const install = (item: Listing) => {
    if (!item.installable) return;
    if (installed.includes(item.id)) {
      if (item.icon) openApp(item.icon as never, undefined, item.name);
      return;
    }
    setInstalling((i) => ({ ...i, [item.id]: 0 }));
    const timer = window.setInterval(() => {
      setInstalling((i) => {
        const next = Math.min(100, (i[item.id] ?? 0) + Math.random() * 26 + 8);
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setInstalling((s) => {
              const copy = { ...s };
              delete copy[item.id];
              return copy;
            });
            setInstalled((s) => [...s, item.id]);
            pushToast({
              appId: 'store',
              title: `${item.name} installed`,
              body: 'It is pinned to your start menu. Nothing was actually downloaded — this is a demo.',
            });
          }, 380);
        }
        return { ...i, [item.id]: next };
      });
    }, 190);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <span className="text-[12px] pl-1 pr-1" style={{ color: 'var(--os-text-muted)' }}>
          Browse
        </span>
        {(['All', 'Recreation', 'Developer tools', 'Productivity', 'Personalisation'] as const).map((c) => (
          <button key={c} className={`tool-btn whitespace-nowrap ${category === c ? 'tool-btn--on' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
        <span className="flex-1" />
        <span className="text-[11.5px] pr-1" style={{ color: 'var(--os-text-muted)' }}>
          {installed.length} installed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* featured banner */}
        <button
          className="w-full text-left rounded-xl overflow-hidden panel card-hover relative mb-4"
          onClick={() => openApp('studio', undefined, 'Sound Lab')}
        >
          <div className="h-[168px] flex items-center px-6 gap-6" style={{ background: 'linear-gradient(120deg, color-mix(in srgb, var(--os-accent) 26%, transparent), color-mix(in srgb, #a35bd4 20%, transparent) 60%, transparent)' }}>
            <AppIcon id="studio" size={76} radius={20} />
            <div className="min-w-0">
              <span className="pill">Featured · built in</span>
              <p className="text-[19px] font-semibold mt-2">Sound Lab</p>
              <p className="text-[12.5px] mt-1 max-w-[56ch]" style={{ color: 'var(--os-text-muted)' }}>
                Every sound here is generated live in the browser with the Web Audio API. There is not a single audio
                file on this site, and the waveform is reading real mixer gain.
              </p>
            </div>
          </div>
        </button>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((item, i) => {
            const progress = installing[item.id];
            const isInstalled = installed.includes(item.id) || !item.installable;
            return (
              <motion.div
                key={item.id}
                className="rounded-xl p-3.5 panel flex flex-col"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
              >
                <div className="flex items-start gap-3">
                  <AppIcon id={(item.icon ?? item.app ?? 'store') as never} size={46} radius={12} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold truncate">{item.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
                      {item.publisher}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StarIcon size={11} fill="#f0b429" color="#f0b429" />
                      <span className="text-[11px]">{item.rating}</span>
                      <span className="text-[10.5px]" style={{ color: 'var(--os-text-muted)' }}>
                        ({item.reviews})
                      </span>
                      <span className="text-[10.5px]" style={{ color: 'var(--os-text-muted)' }}>
                        · {item.size}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] leading-relaxed mt-3 flex-1" style={{ color: 'var(--os-text-muted)' }}>
                  {item.blurb}
                </p>

                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    className="h-8 px-3.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5"
                    style={{
                      background: isInstalled && item.installable ? 'color-mix(in srgb, var(--os-text) 8%, transparent)' : 'var(--os-accent)',
                      color: isInstalled && item.installable ? 'var(--os-text)' : '#fff',
                    }}
                    onClick={() => {
                      if (!item.installable && item.app) {
                        openApp(item.app as never, undefined, item.name);
                        return;
                      }
                      install(item);
                    }}
                    disabled={progress !== undefined}
                  >
                    {progress !== undefined ? (
                      <>
                        <StatusGlyphs.spinner size={13} className="animate-spin" /> {Math.round(progress)}%
                      </>
                    ) : isInstalled && item.installable ? (
                      <>
                        <DoneIcon size={13} /> Installed
                      </>
                    ) : !item.installable ? (
                      <>
                        <GetIcon size={13} /> Open
                      </>
                    ) : (
                      <>
                        <GetIcon size={13} /> Get
                      </>
                    )}
                  </button>

                  <span className="text-[10.5px] px-2 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--os-text) 7%, transparent)', color: 'var(--os-text-muted)' }}>
                    {item.category}
                  </span>
                </div>

                <AnimatePresence>
                  {progress !== undefined && (
                    <motion.div
                      className="mt-2.5 h-1 rounded-full overflow-hidden"
                      style={{ background: 'color-mix(in srgb, var(--os-text) 10%, transparent)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="block h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--os-accent)', transition: 'width .19s ease' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl p-4 panel flex items-start gap-3">
          <PlusIcon size={16} style={{ color: 'var(--os-accent)' }} className="mt-0.5 shrink-0" />
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
            Nothing on this page is downloaded. The store is real UI with simulated installs, so the progress bars are
            honest about being theatre. Everything marked “built in” is already on this machine.
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]" style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}>
        <span>{list.length} listings</span>
        <span>{category}</span>
      </div>
    </div>
  );
}
