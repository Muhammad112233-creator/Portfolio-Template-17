import { useEffect, useState } from 'react';
import { useOS } from '../../store/os';
import { StatusGlyphs } from '../../lib/icons';
import { posts } from '../../data/blog';

const { plus: PlusIcon, trash: TrashIcon, check: SavedIcon, copy: CopyIcon } = StatusGlyphs;

interface Note {
  id: string;
  title: string;
  body: string;
  at: number;
  pinned?: boolean;
}

const seed: Note[] = [
  {
    id: 'n1',
    title: 'Cadence migration',
    body: 'Codemod covers 1,412 screens.\nRemaining: the three invoice templates nobody owns.\nDelete the old folder once those are done — the deletion is the part that makes it stick.',
    at: Date.now() - 1000 * 60 * 60 * 26,
    pinned: true,
  },
  {
    id: 'n2',
    title: 'Talk outline',
    body: 'Thesis: the default is the product.\n1. The fifteen-minute decision\n2. Who is better off under each state\n3. Why a switch is usually a design failure',
    at: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: 'n3',
    title: 'Reading',
    body: 'Refactoring UI — re-read the spacing chapter.\nThinking in Systems — chapter 3 twice.\nAnything by anyone who has shipped a table with 50k rows.',
    at: Date.now() - 1000 * 60 * 60 * 92,
  },
];

export function NotesApp() {
  const notesEnabled = useOS((s) => s.notes);
  const setNotes = useOS((s) => s.setNotes);
  const pushToast = useOS((s) => s.pushToast);

  const [list, setList] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem('rayanos-notes-list');
      return raw ? (JSON.parse(raw) as Note[]) : seed;
    } catch {
      return seed;
    }
  });
  const [activeId, setActiveId] = useState<string | null>(list[0]?.id ?? null);
  const [draft, setDraft] = useState(notesEnabled);
  const [justSaved, setJustSaved] = useState(false);
  const [query, setQuery] = useState('');

  const active = list.find((n) => n.id === activeId) ?? null;

  /* persist the scratchpad */
  useEffect(() => {
    try {
      localStorage.setItem('rayanos-notes-list', JSON.stringify(list));
    } catch {
      /* storage full or blocked */
    }
  }, [list]);

  const save = () => {
    setNotes(draft);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1600);
    pushToast({ appId: 'notes', title: 'Saved', body: 'Your scratchpad is stored in this browser.' });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const filtered = query
    ? list.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase()))
    : list;

  const addNote = () => {
    const n: Note = { id: `n-${Date.now()}`, title: 'Untitled note', body: '', at: Date.now() };
    setList((l) => [n, ...l]);
    setActiveId(n.id);
  };

  const update = (patch: Partial<Note>) => {
    if (!active) return;
    setList((l) => l.map((n) => (n.id === active.id ? { ...n, ...patch, at: Date.now() } : n)));
  };

  return (
    <div className="h-full flex">
      <aside className="w-[218px] shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--os-border)' }}>
        <div className="p-2.5 flex items-center gap-2">
          <button className="tool-btn flex-1 justify-center" onClick={addNote}>
            <PlusIcon size={14} /> New note
          </button>
        </div>
        <div className="px-2.5 pb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes"
            className="field !h-8 !text-[12px]"
            aria-label="Search notes"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {filtered.map((n) => (
            <button
              key={n.id}
              className="w-full text-left px-2.5 py-2 rounded-lg transition-colors"
              style={{ background: activeId === n.id ? 'color-mix(in srgb, var(--os-accent) 16%, transparent)' : 'transparent' }}
              onClick={() => setActiveId(n.id)}
            >
              <span className="flex items-center gap-1.5">
                {n.pinned && <StatusGlyphs.pin size={11} style={{ color: 'var(--os-accent)' }} />}
                <span className="block text-[12.5px] font-medium truncate">{n.title || 'Untitled'}</span>
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                {n.body.split('\n')[0] || 'Empty note'}
              </span>
              <span className="block text-[10px] mt-1" style={{ color: 'var(--os-text-muted)' }}>
                {new Date(n.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-[12px] px-2.5 py-4 text-center" style={{ color: 'var(--os-text-muted)' }}>
              Nothing found.
            </p>
          )}
        </div>

        <div className="p-2.5 border-t" style={{ borderColor: 'var(--os-border)' }}>
          <p className="text-[10.5px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
            Scratchpad
          </p>
          <p className="text-[11px] mb-2" style={{ color: 'var(--os-text-muted)' }}>
            Ctrl+S anywhere in this app
          </p>
          <button className="tool-btn w-full justify-center" onClick={save}>
            {justSaved ? <SavedIcon size={14} /> : <CopyIcon size={14} />}
            {justSaved ? 'Saved' : 'Save scratchpad'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--os-border)' }}>
              <input
                value={active.title}
                onChange={(e) => update({ title: e.target.value })}
                className="flex-1 bg-transparent outline-none text-[14px] font-semibold"
                placeholder="Note title"
                aria-label="Note title"
              />
              <button
                className={`tool-btn ${active.pinned ? 'tool-btn--on' : ''}`}
                onClick={() => update({ pinned: !active.pinned })}
                title="Pin note"
              >
                <StatusGlyphs.pin size={14} />
              </button>
              <button
                className="tool-btn"
                onClick={() => {
                  setList((l) => l.filter((n) => n.id !== active.id));
                  setActiveId(filtered.find((n) => n.id !== active.id)?.id ?? null);
                }}
                title="Delete note"
              >
                <TrashIcon size={14} />
              </button>
            </div>
            <textarea
              value={active.body}
              onChange={(e) => update({ body: e.target.value })}
              placeholder="Start writing…"
              className="flex-1 p-4 bg-transparent outline-none resize-none text-[13px] leading-[1.85]"
              style={{ fontFamily: 'inherit' }}
            />
            <div className="px-4 py-2 border-t text-[10.5px] flex items-center justify-between" style={{ borderColor: 'var(--os-border)', color: 'var(--os-text-muted)' }}>
              <span>{active.body.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>Updated {new Date(active.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </>
        ) : (
          <div className="grid place-items-center h-full text-center px-6">
            <div>
              <p className="text-[13px]" style={{ color: 'var(--os-text-muted)' }}>
                No note selected.
              </p>
              <button className="chip mt-3" onClick={addNote}>
                <PlusIcon size={13} /> Create one
              </button>
            </div>
          </div>
        )}

        {/* reading list cross-link */}
        <div className="shrink-0 border-t px-3 py-2" style={{ borderColor: 'var(--os-border)' }}>
          <p className="text-[10.5px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--os-text-muted)' }}>
            Latest writing
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {posts.map((p) => (
              <button
                key={p.slug}
                className="chip whitespace-nowrap"
                onClick={() =>
                  useOS.getState().openApp('browser', { route: `/writing/${p.slug}` }, 'Meridian Browser')
                }
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
