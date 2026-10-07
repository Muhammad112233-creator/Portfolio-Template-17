import { useEffect, useState } from 'react';
import { useOS } from '../../store/os';
import { StatusGlyphs } from '../../lib/icons';

const COLORS = [
  { id: 'yellow', paper: '#f7e8a4', ink: '#403818', label: 'Yellow' },
  { id: 'mint', paper: '#c9ecd6', ink: '#183a26', label: 'Mint' },
  { id: 'blush', paper: '#f8d5dd', ink: '#451d28', label: 'Blush' },
  { id: 'sky', paper: '#cfe3fa', ink: '#172c46', label: 'Sky' },
];

export function StickyApp({ windowId }: { windowId: string }) {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(`rayanos-sticky-${windowId}`) ?? 'One small note.\n\nEverything here saves as you type.';
    } catch {
      return 'One small note.';
    }
  });
  const [color, setColor] = useState(COLORS[0]);
  const [saved, setSaved] = useState(true);
  const pushToast = useOS((s) => s.pushToast);

  useEffect(() => {
    setSaved(false);
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(`rayanos-sticky-${windowId}`, text);
      } catch {
        /* storage unavailable */
      }
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(t);
  }, [text, windowId]);

  return (
    <div className="h-full flex flex-col" style={{ background: color.paper, color: color.ink }}>
      <div className="flex items-center gap-1 px-2.5 py-2">
        {COLORS.map((c) => (
          <button
            key={c.id}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{ background: c.paper, outline: color.id === c.id ? `2px solid ${color.ink}` : 'none', outlineOffset: 1.5 }}
            onClick={() => setColor(c)}
            title={c.label}
            aria-label={c.label}
          />
        ))}
        <span className="flex-1" />
        <span className="text-[10.5px] opacity-60">{saved ? 'Saved' : 'Saving…'}</span>
        <button
          className="grid place-items-center w-6 h-6 rounded opacity-70 hover:opacity-100"
          onClick={() => {
            setText('');
            pushToast({ appId: 'notepad', title: 'Note cleared', body: 'Fresh page, same old handwriting.' });
          }}
          aria-label="Clear note"
        >
          <StatusGlyphs.trash size={13} />
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="flex-1 p-3.5 bg-transparent outline-none resize-none text-[13px] leading-[1.9]"
        style={{ fontFamily: 'inherit', color: color.ink }}
        placeholder="Write something you will actually read later…"
        aria-label="Sticky note"
      />

      <div className="px-3.5 pb-2.5 flex items-center justify-between text-[10.5px] opacity-60">
        <span>{text.trim() ? `${text.trim().split(/\s+/).length} words` : 'Empty'}</span>
        <span>Autosaves locally</span>
      </div>
    </div>
  );
}
