import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { FileGlyph, StatusGlyphs, AppIcon } from '../../lib/icons';
import { projects } from '../../data/projects';
import { gallery } from '../../data/projects';
import { posts } from '../../data/blog';
import { profile, experience, skillGroups } from '../../data/profile';

const { chevronRight: Chevron, arrowLeft: BackIcon, gridView: GridIcon, listView: ListIcon, search: SearchIcon, download: DownloadIcon } = StatusGlyphs;

interface Node {
  name: string;
  kind: 'folder' | 'code' | 'doc' | 'image' | 'audio' | 'sheet' | 'app';
  size?: string;
  modified: string;
  open?: () => void;
}

interface Folder {
  id: string;
  path: string;
  icon: string;
  items: Node[];
}

export function ExplorerApp() {
  const openApp = useOS((s) => s.openApp);
  const pushToast = useOS((s) => s.pushToast);
  const [path, setPath] = useState<string[]>(['D:', 'Projects']);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const tree: Folder[] = [
    { id: 'root', path: 'D:/', icon: 'app', items: [] },
    {
      id: 'projects',
      path: 'D:/Projects',
      icon: 'app',
      items: [
        { name: 'Cadence', kind: 'folder', modified: '2025-11-02', open: () => openApp('works', { projectId: 'cadence' }, 'Workbench') },
        { name: 'Trellis', kind: 'folder', modified: '2025-09-18', open: () => openApp('works', { projectId: 'trellis' }, 'Workbench') },
        { name: 'Palette', kind: 'folder', modified: '2024-12-04', open: () => openApp('works', { projectId: 'palette' }, 'Workbench') },
        { name: 'Ledgerly', kind: 'folder', modified: '2023-08-21', open: () => openApp('works', { projectId: 'ledgerly' }, 'Workbench') },
        { name: 'Rickshaw', kind: 'folder', modified: '2022-06-30', open: () => openApp('works', { projectId: 'rickshaw' }, 'Workbench') },
        { name: 'AtlasType', kind: 'folder', modified: '2026-02-11', open: () => openApp('works', { projectId: 'atlas-type' }, 'Workbench') },
        { name: 'QuietHours', kind: 'folder', modified: '2023-03-09', open: () => openApp('works', { projectId: 'quiet-hours' }, 'Workbench') },
        { name: 'LoomNotes', kind: 'folder', modified: '2021-10-14', open: () => openApp('works', { projectId: 'loom' }, 'Workbench') },
        { name: 'README.md', kind: 'doc', size: '4 KB', modified: '2026-03-01', open: () => openApp('browser', { route: '/biography' }, 'Meridian Browser') },
        { name: 'stack.json', kind: 'code', size: '1 KB', modified: '2026-01-12', open: () => openApp('terminal', undefined, 'Terminal') },
      ],
    },
    {
      id: 'documents',
      path: 'D:/Documents',
      icon: 'doc',
      items: [
        { name: 'resume.pdf', kind: 'doc', size: '184 KB', modified: '2026-02-20', open: () => openApp('resume', undefined, 'Resume') },
        { name: 'biography.md', kind: 'doc', size: '12 KB', modified: '2026-01-30', open: () => openApp('browser', { route: '/biography' }, 'Meridian Browser') },
        { name: 'writing', kind: 'folder', modified: '2026-08-14', open: () => openApp('browser', { route: '/writing' }, 'Meridian Browser') },
        { name: 'testimonials.txt', kind: 'doc', size: '3 KB', modified: '2025-12-11' },
        { name: 'skills.csv', kind: 'sheet', size: '2 KB', modified: '2026-01-05', open: () => openApp('resume', undefined, 'Resume') },
      ],
    },
    {
      id: 'media',
      path: 'D:/Media',
      icon: 'image',
      items: [
        { name: 'gallery', kind: 'folder', modified: '2026-04-02', open: () => openApp('gallery', undefined, 'Photos') },
        { name: 'wallpapers', kind: 'folder', modified: '2026-04-02', open: () => openApp('settings', { tab: 'appearance' }, 'Settings') },
        { name: 'ambient-sessions.wav', kind: 'audio', size: '48 MB', modified: '2025-07-19', open: () => openApp('studio', undefined, 'Sound Lab') },
        { name: 'talk-interface-decisions.mp4', kind: 'doc', size: '1.2 GB', modified: '2025-06-22' },
      ],
    },
    {
      id: 'system',
      path: 'D:/System',
      icon: 'app',
      items: [
        { name: 'rayanos.config', kind: 'code', size: '8 KB', modified: '2026-04-07', open: () => openApp('settings', undefined, 'Settings') },
        { name: 'shell.log', kind: 'code', size: '156 KB', modified: '2026-04-07', open: () => openApp('terminal', undefined, 'Terminal') },
        { name: 'memory-wall.db', kind: 'sheet', size: '22 KB', modified: '2026-04-07', open: () => openApp('wall', undefined, 'Memory Wall') },
      ],
    },
  ];

  // flatten for the current path
  const flat: Node[] = [];
  if (path.length === 1) {
    tree.slice(1).forEach((f) => flat.push({ name: f.path.replace('D:/', ''), kind: 'folder', modified: '2026-04-07' }));
  } else {
    const folder = tree.find((t) => t.path === path.join('/'));
    folder?.items.forEach((i) => flat.push(i));
  }

  // subfolder support so navigation feels real
  const enterFolder = (name: string) => {
    if (path.length === 1) {
      const f = tree.find((t) => t.path === `D:/${name}`);
      if (f) {
        setPath(['D:', name]);
        setSelected(null);
      }
      return;
    }
    if (name === 'writing') {
      setPath(['D:', 'Documents', 'writing']);
      return;
    }
    if (name === 'gallery') {
      setPath(['D:', 'Media', 'gallery']);
      return;
    }
    const node = flat.find((f) => f.name === name);
    if (node?.kind === 'folder') setPath([...path, name]);
    else node?.open?.();
  };

  const extraForPath = () => {
    const key = path.join('/');
    if (key === 'D:/Documents/writing')
      return posts.map((p) => ({
        name: `${p.slug}.md`,
        kind: 'doc' as const,
        size: `${p.readTime}`,
        modified: p.date,
        open: () => openApp('browser', { route: `/writing/${p.slug}` }, 'Meridian Browser'),
      }));
    if (key === 'D:/Media/gallery')
      return gallery.map((g) => ({
        name: g.file,
        kind: 'image' as const,
        size: '2.4 MB',
        modified: `${g.year}-06-14`,
        open: () => openApp('gallery', { photoId: g.id }, 'Photos'),
      }));
    if (key === 'D:/System/skills' || key === 'D:/Projects/Cadence')
      return projects.map((p) => ({ name: `${p.id}.md`, kind: 'code' as const, size: '18 KB', modified: p.year }));
    return [];
  };

  const combined = [...flat, ...extraForPath()];
  const filtered = q ? combined.filter((n) => n.name.toLowerCase().includes(q.toLowerCase())) : combined;

  const onOpen = (n: Node) => {
    if (n.open) n.open();
    else if (n.kind === 'folder') enterFolder(n.name);
    else
      pushToast({
        appId: 'explorer',
        title: 'No default app',
        body: `${n.name} does not have a handler registered in this demo build.`,
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <button className="tool-btn" disabled={path.length === 1} onClick={() => setPath(path.slice(0, -1))} style={{ opacity: path.length === 1 ? 0.4 : 1 }}>
          <BackIcon size={15} />
        </button>

        <div
          className="flex-1 flex items-center gap-0.5 h-8 px-2 rounded-md text-[12px] min-w-0 overflow-hidden"
          style={{ background: 'color-mix(in srgb, var(--os-text) 6%, transparent)', border: '1px solid var(--os-border)' }}
        >
          {path.map((p, i) => (
            <span key={i} className="flex items-center gap-0.5 shrink-0">
              <button
                className="px-1.5 py-0.5 rounded hover:bg-white/10"
                onClick={() => setPath(path.slice(0, i + 1))}
              >
                {p}
              </button>
              {i < path.length - 1 && <Chevron size={12} className="opacity-50" />}
            </span>
          ))}
        </div>

        <div
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md w-[168px]"
          style={{ background: 'color-mix(in srgb, var(--os-text) 6%, transparent)', border: '1px solid var(--os-border)' }}
        >
          <SearchIcon size={13} style={{ color: 'var(--os-text-muted)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search here"
            className="flex-1 bg-transparent outline-none text-[12px]"
            aria-label="Search this folder"
          />
        </div>

        <button className="tool-btn" onClick={() => setView((v) => (v === 'list' ? 'grid' : 'list'))} title="Change view">
          {view === 'list' ? <GridIcon size={15} /> : <ListIcon size={15} />}
        </button>
      </div>

      {/* sidebar + content */}
      <div className="flex-1 flex min-h-0">
        <nav className="w-[186px] shrink-0 border-r overflow-y-auto py-2 px-2 hidden md:block" style={{ borderColor: 'var(--os-border)' }}>
          <p className="px-2 py-1.5 text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
            This PC
          </p>
          {tree.slice(1).map((f) => (
            <button
              key={f.id}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12.5px] text-left transition-colors hover:bg-white/5"
              style={{ background: f.path === path.join('/') ? 'color-mix(in srgb, var(--os-text) 8%, transparent)' : 'transparent' }}
              onClick={() => setPath([...f.path.split('/').filter((x) => x !== 'D:').map((x) => x), f.path])}
            >
              <FileGlyph kind={f.icon} size={16} />
              <span className="truncate">{f.path.replace('D:/', '')}</span>
            </button>
          ))}

          <p className="px-2 py-1.5 mt-3 text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
            Quick access
          </p>
          {[
            { label: 'Desktop', app: 'settings' as const },
            { label: 'Documents', app: 'resume' as const },
            { label: 'Downloads', app: 'store' as const },
            { label: 'Pictures', app: 'gallery' as const },
            { label: 'Music', app: 'studio' as const },
          ].map((q2) => (
            <button
              key={q2.label}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12.5px] text-left transition-colors hover:bg-white/5"
              onClick={() => openApp(q2.app, undefined, undefined)}
            >
              <FileGlyph kind="folder" size={16} />
              <span className="truncate">{q2.label}</span>
            </button>
          ))}

          <p className="px-2 py-1.5 mt-3 text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
            Pinned app
          </p>
          <button
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12.5px] text-left hover:bg-white/5"
            onClick={() => openApp('settings', { tab: 'about' }, 'Settings')}
          >
            <AppIcon id="settings" size={18} radius={5} />
            <span>About this PC</span>
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto p-3">
          {view === 'list' ? (
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ color: 'var(--os-text-muted)' }}>
                  <th className="text-left font-medium px-3 py-2">Name</th>
                  <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Size</th>
                  <th className="text-left font-medium px-3 py-2 hidden md:table-cell">Modified</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, i) => (
                  <motion.tr
                    key={`${n.name}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.012, 0.2) }}
                    className="cursor-pointer"
                    style={{ background: selected === n.name ? 'color-mix(in srgb, var(--os-accent) 16%, transparent)' : 'transparent' }}
                    onClick={() => setSelected(n.name)}
                    onDoubleClick={() => onOpen(n)}
                  >
                    <td className="px-3 py-1.5">
                      <span className="flex items-center gap-2.5">
                        <FileGlyph kind={n.kind} size={18} />
                        <span className="truncate">{n.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-1.5 hidden sm:table-cell" style={{ color: 'var(--os-text-muted)' }}>
                      {n.size ?? '—'}
                    </td>
                    <td className="px-3 py-1.5 hidden md:table-cell" style={{ color: 'var(--os-text-muted)' }}>
                      {n.modified}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {filtered.map((n) => (
                <button
                  key={n.name}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-colors hover:bg-white/5"
                  style={{ background: selected === n.name ? 'color-mix(in srgb, var(--os-accent) 16%, transparent)' : 'transparent' }}
                  onClick={() => setSelected(n.name)}
                  onDoubleClick={() => onOpen(n)}
                >
                  <FileGlyph kind={n.kind} size={34} />
                  <span className="text-[11.5px] line-clamp-2 break-all">{n.name}</span>
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center py-14 text-[13px]" style={{ color: 'var(--os-text-muted)' }}>
              This folder is empty.
            </p>
          )}

          {path.join('/') === 'D:/Projects' && (
            <div className="mt-6 p-4 rounded-xl panel">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-semibold flex items-center gap-2">
                  <DownloadIcon size={14} /> Project index
                </p>
                <span className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
                  {projects.length} repositories
                </span>
              </div>
              <p className="text-[12px] mt-2 leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
                {experience[0].summary} Working from {profile.location}, {skillGroups[0].items.length + skillGroups[1].items.length}+ tools in rotation.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]"
        style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}
      >
        <span>{filtered.length} items</span>
        <span>{selected ? `Selected: ${selected}` : path.join('/')}</span>
      </div>
    </div>
  );
}
