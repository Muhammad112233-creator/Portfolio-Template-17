import { useEffect, useRef, useState } from 'react';
import { useOS, WALLPAPERS, ACCENTS, type AppId } from '../../store/os';
import { profile, experience, skillGroups } from '../../data/profile';
import { projects } from '../../data/projects';
import { posts } from '../../data/blog';
import { APPS } from '../../data/apps';
import { StatusGlyphs } from '../../lib/icons';

interface Line {
  type: 'in' | 'out' | 'err' | 'ok';
  text: string;
}

const BANNER = [
  'RayanOS shell — version 4.2 (build 2026.04.07)',
  'Type "help" for a list of commands. Tab completes, ↑ recalls history.',
  '',
];

export function TerminalApp() {
  const [lines, setLines] = useState<Line[]>(BANNER.map((t) => ({ type: 'out' as const, text: t })));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const os = useOS();

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const push = (...items: Line[]) => setLines((l) => [...l, ...items]);
  const out = (text: string) => ({ type: 'out' as const, text });
  const ok = (text: string) => ({ type: 'ok' as const, text });
  const err = (text: string) => ({ type: 'err' as const, text });

  const COMMANDS: Record<string, { desc: string; run: (args: string[]) => void }> = {
    help: {
      desc: 'List every available command',
      run: () => {
        push(out('Available commands'));
        push(out(''));
        Object.entries(COMMANDS).forEach(([name, c]) => {
          push(out(`  ${name.padEnd(14)} ${c.desc}`));
        });
        push(out(''));
        push(out('Everything is case-insensitive. Some commands take arguments.'));
      },
    },
    whoami: {
      desc: 'Who is running this machine',
      run: () => {
        push(ok(profile.name));
        push(out(`${profile.role} · ${profile.roleSecondary}`));
        push(out(profile.location));
        push(out(''));
        push(out(profile.summary));
      },
    },
    about: {
      desc: 'Alias for whoami with contact details',
      run: () => {
        push(ok(profile.name));
        push(out(`Email   ${profile.email}`));
        push(out(`Phone   ${profile.phone}`));
        push(out(`Where   ${profile.location} · ${profile.timezone}`));
        push(out(`Status  ${profile.availability}`));
      },
    },
    projects: {
      desc: 'List every case study',
      run: () => {
        push(out(`${projects.length} projects on this machine:`));
        push(out(''));
        projects.forEach((p) => {
          push(out(`  ${p.id.padEnd(14)} ${p.year}  ${p.kind.padEnd(18)} ${p.tagline}`));
        });
        push(out(''));
        push(out('Run "open <id>" to launch one.'));
      },
    },
    open: {
      desc: 'open <app|project> — launch a window',
      run: (args) => {
        const key = (args[0] ?? '').toLowerCase();
        if (!key) return push(err('usage: open <app|project>'));
        const project = projects.find((p) => p.id === key || p.name.toLowerCase() === key);
        if (project) {
          os.openApp('works', { projectId: project.id }, 'Workbench');
          return push(ok(`Opening ${project.name} in Workbench…`));
        }
        const app = APPS.find((a) => a.id === key || a.name.toLowerCase().startsWith(key));
        if (app) {
          os.openApp(app.id as AppId, undefined, app.name);
          return push(ok(`Launching ${app.name}…`));
        }
        push(err(`open: ${key}: no such app or project. Try "projects" or "apps".`));
      },
    },
    apps: {
      desc: 'List installed applications',
      run: () => {
        push(out(`${APPS.length} applications installed:`));
        push(out(''));
        APPS.forEach((a) => push(out(`  ${a.id.padEnd(12)} ${a.name.padEnd(18)} ${a.blurb}`)));
      },
    },
    writing: {
      desc: 'List published posts',
      run: () => {
        posts.forEach((p) => push(out(`  ${p.date}  ${p.readTime.padEnd(7)} ${p.title}`)));
        push(out(''));
        push(out('Run "read <slug>" to open one.'));
      },
    },
    read: {
      desc: 'read <slug> — open a post in the browser',
      run: (args) => {
        const slug = args[0];
        const post = posts.find((p) => p.slug === slug || p.title.toLowerCase().includes((slug ?? '').toLowerCase()));
        if (!post) return push(err(`read: ${slug ?? ''}: no such post. Run "writing".`));
        os.openApp('browser', { route: `/writing/${post.slug}` }, 'Meridian Browser');
        push(ok(`Opening “${post.title}” …`));
      },
    },
    resume: {
      desc: 'Print the experience timeline',
      run: () => {
        experience.forEach((e) => {
          push(out(`${e.period}  ${e.role} — ${e.company} (${e.location})`));
          push(out(`            ${e.summary}`));
        });
        push(out(''));
        push(out('Run "open resume" for the full document.'));
      },
    },
    skills: {
      desc: 'List skills by group',
      run: () => {
        skillGroups.forEach((g) => {
          push(out(`${g.group}:`));
          push(out(`  ${g.items.join(', ')}`));
          push(out(''));
        });
      },
    },
    contact: {
      desc: 'Show contact details and open the form',
      run: () => {
        push(ok(`Email  ${profile.email}`));
        push(out(`Phone  ${profile.phone}`));
        profile.socials.forEach((s) => push(out(`${s.label.padEnd(10)} ${s.handle}`)));
        os.openApp('contact', undefined, 'Contact');
        push(out(''));
        push(out('Contact window opened.'));
      },
    },
    theme: {
      desc: 'theme <light|dark> — switch appearance',
      run: (args) => {
        const v = args[0];
        if (v !== 'light' && v !== 'dark') return push(err('usage: theme <light|dark>'));
        os.setTheme(v);
        push(ok(`Theme set to ${v}.`));
      },
    },
    accent: {
      desc: 'accent <name> — change the system colour',
      run: (args) => {
        const name = (args[0] ?? '').toLowerCase();
        const found = ACCENTS.find((a) => a.id === name);
        if (!found) return push(err(`accent: ${name || '(none)'}: choose ${ACCENTS.map((a) => a.id).join(', ')}`));
        os.setAccent(found.hex);
        push(ok(`Accent set to ${found.label}.`));
      },
    },
    wallpaper: {
      desc: 'wallpaper <name> — change the desktop background',
      run: (args) => {
        const name = (args[0] ?? '').toLowerCase();
        const found = WALLPAPERS.find((w) => w.id === name);
        if (!found) return push(err(`wallpaper: ${name || '(none)'}: choose ${WALLPAPERS.map((w) => w.id).join(', ')}`));
        os.setWallpaper(found.id);
        push(ok(`Wallpaper set to ${found.label}.`));
      },
    },
    date: { desc: 'Show the current date and time', run: () => push(out(new Date().toString())) },
    window: {
      desc: 'window <minimize-all|close-all> — control open windows',
      run: (args) => {
        const a = args[0];
        if (a === 'minimize-all') {
          os.minimizeAll();
          return push(ok('All windows minimized.'));
        }
        if (a === 'close-all') {
          os.windows.forEach((w) => os.closeWindow(w.id));
          return push(ok('All windows closed.'));
        }
        push(out(`${os.windows.length} window(s) open:`));
        os.windows.forEach((w) => push(out(`  ${w.appId.padEnd(12)} ${w.rect.w}×${w.rect.h}  ${w.minimized ? 'minimized' : 'visible'}`)));
      },
    },
    notify: {
      desc: 'notify <text> — send yourself a notification',
      run: (args) => {
        const text = args.join(' ') || 'You sent yourself a notification. Well done.';
        os.pushToast({ appId: 'terminal', title: 'Terminal', body: text });
        push(ok('Notification sent.'));
      },
    },
    wall: {
      desc: 'Open the memory wall',
      run: () => {
        os.openApp('wall', undefined, 'Memory Wall');
        push(ok('Opening the Memory Wall…'));
      },
    },
    play: {
      desc: 'Open the ambient sound lab',
      run: () => {
        os.openApp('studio', undefined, 'Sound Lab');
        push(ok('Sound Lab opened. Press the play button.'));
      },
    },
    matrix: {
      desc: 'Do not run this',
      run: () => {
        push(ok('Wake up…'));
        let i = 0;
        const id = window.setInterval(() => {
          push(out(''.padEnd(60, i % 2 ? '1 ' : '0 ')));
          i += 1;
          if (i > 9) {
            window.clearInterval(id);
            push(out(''));
            push(out('Just kidding. Nothing here is that kind of website.'));
          }
        }, 90);
      },
    },
    coffee: {
      desc: 'Brew one',
      run: () => {
        push(out('Brewing…'));
        window.setTimeout(() => push(err('Error 418: I am a teapot. Also, this machine has no water.')), 700);
        window.setTimeout(() => push(out('Try the Sound Lab instead — it is about as relaxing.')), 1100);
      },
    },
    sudo: {
      desc: 'Elevate privileges',
      run: () => push(err(`${profile.shortName} is not in the sudoers file. This incident has been logged in a nice, friendly way.`)),
    },
    exit: {
      desc: 'Close the terminal window',
      run: () => {
        push(out('Closing…'));
        const win = os.windows.find((w) => w.appId === 'terminal');
        window.setTimeout(() => win && os.closeWindow(win.id), 320);
      },
    },
    clear: { desc: 'Clear the screen', run: () => setLines([]) },
  };

  const run = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const [cmd, ...args] = trimmed.split(/\s+/);
    push({ type: 'in', text: `➜ ${trimmed}` });
    const found = COMMANDS[cmd.toLowerCase()];
    if (!found) {
      push(err(`command not found: ${cmd}`));
      push(out('Type "help" for the list.'));
    } else {
      found.run(args);
    }
    push(out(''));
    setHistory((h) => [trimmed, ...h]);
    setHIdx(-1);
  };

  const complete = () => {
    const partial = input.trim().toLowerCase();
    if (!partial) return;
    const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(partial));
    if (matches.length === 1) setInput(`${matches[0]} `);
    else if (matches.length > 1) {
      push({ type: 'in', text: `➜ ${input}` });
      push(out(matches.join('  ')));
      push(out(''));
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: 'color-mix(in srgb, #06080e 92%, transparent)', color: '#d5dbe8' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-3 h-8 text-[11px] shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,.08)', color: '#8b94a8' }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-2">rayan@rayanos — zsh — 80×24</span>
        <span className="flex-1" />
        <span>{os.windows.length} open</span>
      </div>

      <div ref={boxRef} className="flex-1 overflow-y-auto px-3.5 py-3 terminal-text">
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color:
                l.type === 'err' ? '#ff8f8f' : l.type === 'ok' ? '#8ee08e' : l.type === 'in' ? '#9ec1ff' : '#c6cddc',
            }}
          >
            {l.text || '\u00A0'}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <span style={{ color: '#8ee08e' }}>➜</span>
          <span style={{ color: '#9ec1ff' }}>~</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                run(input);
                setInput('');
              } else if (e.key === 'Tab') {
                e.preventDefault();
                complete();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const next = Math.min(history.length - 1, hIdx + 1);
                setHIdx(next);
                setInput(history[next] ?? '');
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = Math.max(-1, hIdx - 1);
                setHIdx(next);
                setInput(next === -1 ? '' : history[next] ?? '');
              } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                setLines([]);
              }
            }}
            className="flex-1 bg-transparent outline-none terminal-text"
            style={{ color: '#e8edf7', caretColor: '#8ee08e' }}
            spellCheck={false}
            aria-label="Terminal input"
          />
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3 px-3.5 h-7 text-[10.5px]" style={{ borderTop: '1px solid rgba(255,255,255,.08)', color: '#7c869c' }}>
        <span className="flex items-center gap-1.5">
          <StatusGlyphs.terminal size={11} /> {Object.keys(COMMANDS).length} commands
        </span>
        <span>Tab completes</span>
        <span className="flex-1" />
        <span>Ctrl+L clears</span>
      </div>
    </div>
  );
}
