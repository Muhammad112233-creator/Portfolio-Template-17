import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../../store/os';
import { StatusGlyphs } from '../../lib/icons';

const { heart: HeartIcon, send: SendIcon, trash: TrashIcon, refresh: ResetIcon } = StatusGlyphs;

export function WallApp() {
  const wall = useOS((s) => s.wall);
  const addWallPost = useOS((s) => s.addWallPost);
  const pushToast = useOS((s) => s.pushToast);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [liked, setLiked] = useState<string[]>([]);

  const post = () => {
    if (text.trim().length < 2) {
      pushToast({ appId: 'wall', title: 'A little more', body: 'Write at least a couple of characters before posting.' });
      return;
    }
    addWallPost(name, text);
    setText('');
    pushToast({ appId: 'wall', title: 'Posted to the wall', body: 'It is saved in this browser, on this machine only.' });
  };

  const reset = () => {
    useOS.setState({
      wall: [
        {
          id: `w-${Date.now()}`,
          name: 'Rayan',
          text: 'Wall cleared. Be the first to say something.',
          at: Date.now(),
          color: '#5c83ff',
        },
      ],
    });
  };

  const relative = (t: number) => {
    const diff = Date.now() - t;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <StatusGlyphs.heart size={15} style={{ color: 'var(--os-accent)' }} />
        <span className="text-[12.5px] font-medium">Memory Wall</span>
        <span className="text-[11.5px]" style={{ color: 'var(--os-text-muted)' }}>
          {wall.length} notes
        </span>
        <span className="flex-1" />
        <button className="tool-btn" onClick={reset}>
          <ResetIcon size={14} /> Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* composer */}
        <div className="rounded-xl p-4 panel mb-4">
          <p className="text-[13px] font-semibold mb-3">Leave a note</p>
          <div className="grid sm:grid-cols-[180px_1fr] gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="field"
              aria-label="Your name"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && post()}
              placeholder="Say hello, leave feedback, or note the bug you found"
              className="field"
              aria-label="Your note"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
              {text.length}/240 characters · stored locally
            </span>
            <button
              className="h-9 px-4 rounded-lg text-[12.5px] font-medium text-white flex items-center gap-2"
              style={{ background: 'var(--os-accent)' }}
              onClick={post}
            >
              <SendIcon size={14} /> Post note
            </button>
          </div>
        </div>

        {/* wall */}
        <div className="columns-1 sm:columns-2 xl:columns-3 gap-3.5 [&>*]:mb-3.5">
          {wall.map((w, i) => (
            <motion.div
              key={w.id}
              className="rounded-xl p-3.5 panel break-inside-avoid"
              initial={{ opacity: 0, y: 14, rotate: i % 2 ? 0.6 : -0.6 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 0.35 : -0.35 }}
              transition={{ delay: Math.min(i * 0.035, 0.4), type: 'spring', stiffness: 360, damping: 28 }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className="grid place-items-center rounded-full text-[11px] font-semibold text-white shrink-0"
                  style={{ width: 28, height: 28, background: w.color }}
                >
                  {w.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium truncate">{w.name}</span>
                  <span className="block text-[10.5px]" style={{ color: 'var(--os-text-muted)' }}>
                    {relative(w.at)}
                  </span>
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed">{w.text}</p>
              <div className="flex items-center gap-3 mt-3 pt-2.5" style={{ borderTop: '1px solid var(--os-border)' }}>
                <button
                  className="flex items-center gap-1.5 text-[11.5px] transition-colors"
                  style={{ color: liked.includes(w.id) ? '#ff5c7c' : 'var(--os-text-muted)' }}
                  onClick={() => setLiked((l) => (l.includes(w.id) ? l.filter((x) => x !== w.id) : [...l, w.id]))}
                >
                  <HeartIcon size={13} fill={liked.includes(w.id) ? '#ff5c7c' : 'none'} />
                  {liked.includes(w.id) ? 'Liked' : 'Like'}
                </button>
                <span className="flex-1" />
                {w.name === 'Rayan' && (
                  <button
                    className="text-[11.5px]"
                    style={{ color: 'var(--os-text-muted)' }}
                    onClick={() => useOS.setState({ wall: useOS.getState().wall.filter((x) => x.id !== w.id) })}
                    aria-label="Delete note"
                  >
                    <TrashIcon size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]" style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}>
        <span>Public messages kept on this device</span>
        <span>Nothing leaves the browser</span>
      </div>
    </div>
  );
}
