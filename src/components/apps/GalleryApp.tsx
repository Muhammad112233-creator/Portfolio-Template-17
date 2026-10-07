import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gallery, projects } from '../../data/projects';
import { StatusGlyphs } from '../../lib/icons';
import { Img } from '../ui/Img';

const { chevronLeft: Prev, chevronRight: Next, close: CloseIcon, listView: ListIcon, gridView: GridIcon, download: DownloadIcon, heart: HeartIcon } = StatusGlyphs;

export function GalleryApp({ payload }: { payload?: Record<string, unknown> }) {
  const startIndex = typeof payload?.photoId === 'string' ? gallery.findIndex((g) => g.id === payload.photoId) : -1;
  const [open, setOpen] = useState(startIndex >= 0 ? startIndex : null);
  const [filter, setFilter] = useState<'All' | string>('All');
  const [density, setDensity] = useState<'masonry' | 'grid'>('masonry');
  const [liked, setLiked] = useState<string[]>([]);

  const shots = useMemo(
    () => (filter === 'All' ? gallery : gallery.filter((g) => g.place === filter)),
    [filter]
  );

  const places = useMemo(() => ['All', ...Array.from(new Set(gallery.map((g) => g.place)))], []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? null : (i + 1) % shots.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? null : (i - 1 + shots.length) % shots.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, shots.length]);

  const current = open !== null ? shots[open] : null;

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <span className="text-[12px] pl-1 pr-1" style={{ color: 'var(--os-text-muted)' }}>
          Album
        </span>
        {places.map((p) => (
          <button key={p} className={`tool-btn ${filter === p ? 'tool-btn--on' : ''}`} onClick={() => setFilter(p)}>
            {p}
          </button>
        ))}
        <span className="flex-1" />
        <button className="tool-btn" onClick={() => setDensity((d) => (d === 'masonry' ? 'grid' : 'masonry'))} title="Change layout">
          {density === 'masonry' ? <GridIcon size={15} /> : <ListIcon size={15} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5">
        {density === 'masonry' ? (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-3.5 [&>*]:mb-3.5">
            {shots.map((g, i) => (
              <button
                key={g.id}
                className="block w-full rounded-xl overflow-hidden panel card-hover text-left break-inside-avoid"
                onClick={() => setOpen(i)}
              >
                <Img
                  src={`./images/gallery/${g.file}`}
                  alt={g.caption}
                  loading="lazy"
                  className="w-full object-cover"
                  style={{ height: g.tall ? 300 : 190 }}
                />
                <span className="block p-3">
                  <span className="block text-[12px] leading-snug line-clamp-2">{g.caption}</span>
                  <span className="flex items-center gap-2 mt-1.5 text-[10.5px]" style={{ color: 'var(--os-text-muted)' }}>
                    <StatusGlyphs.pin size={11} /> {g.place} · {g.year}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {shots.map((g, i) => (
              <button key={g.id} className="relative rounded-xl overflow-hidden panel card-hover" onClick={() => setOpen(i)}>
                <Img src={`./images/gallery/${g.file}`} alt={g.caption} loading="lazy" className="w-full h-[152px] object-cover" />
                {liked.includes(g.id) && (
                  <span className="absolute top-2 right-2 grid place-items-center w-7 h-7 rounded-full" style={{ background: 'rgba(0,0,0,.45)' }}>
                    <HeartIcon size={14} fill="#ff5c7c" color="#ff5c7c" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl panel p-4">
          <p className="text-[12.5px] font-semibold mb-2">From the same machines</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {projects.slice(0, 4).map((p) => (
              <Img key={p.id} src={`./images/projects/${p.image}`} alt={p.name} loading="lazy" className="w-full h-[86px] object-cover rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div
        className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]"
        style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}
      >
        <span>{shots.length} photos</span>
        <span>Arrow keys move through the lightbox</span>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col"
            style={{ background: 'rgba(4,6,12,.9)', backdropFilter: 'blur(14px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
          >
            <div className="flex items-center justify-between p-3 text-white">
              <span className="text-[12px] opacity-80">
                {(open ?? 0) + 1} / {shots.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  className="w-8 h-8 grid place-items-center rounded-md hover:bg-white/12 transition-colors"
                  onClick={() => setLiked((l) => (l.includes(current.id) ? l.filter((x) => x !== current.id) : [...l, current.id]))}
                  aria-label="Favourite"
                >
                  <HeartIcon size={16} fill={liked.includes(current.id) ? '#ff5c7c' : 'none'} color={liked.includes(current.id) ? '#ff5c7c' : 'currentColor'} />
                </button>
                <a
                  className="w-8 h-8 grid place-items-center rounded-md hover:bg-white/12 transition-colors"
                  href={`./images/gallery/${current.file}`}
                  download
                  aria-label="Download photo"
                >
                  <DownloadIcon size={16} />
                </a>
                <button className="w-8 h-8 grid place-items-center rounded-md hover:bg-white/12 transition-colors" onClick={() => setOpen(null)} aria-label="Close">
                  <CloseIcon size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 relative min-h-0 mx-14 my-2">
              <motion.img
                key={current.id}
                src={`./images/gallery/${current.file}`}
                alt={current.caption}
                className="absolute inset-0 h-full w-full object-contain"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.24 }}
                style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.7))' }}
              />
            </div>

            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 grid place-items-center rounded-full text-white transition-colors hover:bg-white/12"
              onClick={() => setOpen((i) => (i === null ? null : (i - 1 + shots.length) % shots.length))}
              aria-label="Previous photo"
            >
              <Prev size={22} />
            </button>

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 grid place-items-center rounded-full text-white transition-colors hover:bg-white/12"
              onClick={() => setOpen((i) => (i === null ? null : (i + 1) % shots.length))}
              aria-label="Next photo"
            >
              <Next size={22} />
            </button>

            <p className="shrink-0 text-center text-[12.5px] text-white/85 px-6 pb-5 pt-1.5">
              {current.caption} <span className="opacity-55">— {current.place}, {current.year}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
