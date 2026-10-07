import { useCallback, useEffect, useRef, useState } from 'react';
import { useOS } from '../../store/os';
import { StatusGlyphs } from '../../lib/icons';

const { play: PlayIcon, pause: PauseIcon, refresh: ResetIcon } = StatusGlyphs;

const COLS = 24;
const ROWS = 18;
const CELL = 20;

interface Point {
  x: number;
  y: number;
}

export function SnakeApp() {
  const [snake, setSnake] = useState<Point[]>([{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]);
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 });
  const [pending, setPending] = useState<Point[]>([]);
  const [food, setFood] = useState<Point>({ x: 15, y: 9 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('rayanos-snake-best') ?? 0));
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [speed, setSpeed] = useState(120);

  const dirRef = useRef(dir);
  dirRef.current = dir;
  const queueRef = useRef<Point[]>([]);

  const placeFood = useCallback((body: Point[]): Point => {
    for (let i = 0; i < 200; i++) {
      const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      if (!body.some((s) => s.x === p.x && s.y === p.y)) return p;
    }
    return { x: 0, y: 0 };
  }, []);

  const reset = () => {
    setSnake([{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]);
    setDir({ x: 1, y: 0 });
    queueRef.current = [];
    setFood({ x: 15, y: 9 });
    setScore(0);
    setOver(false);
    setRunning(false);
  };

  const step = useCallback(() => {
    setSnake((body) => {
      const queued = queueRef.current.shift();
      const d = queued ?? dirRef.current;
      const head = { x: (body[0].x + d.x + COLS) % COLS, y: (body[0].y + d.y + ROWS) % ROWS };
      if (body.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
        setOver(true);
        setRunning(false);
        return body;
      }
      const next = [head, ...body];
      if (head.x === food.x && head.y === food.y) {
        setScore((sc) => {
          const value = sc + 10;
          if (value > best) {
            setBest(value);
            try {
              localStorage.setItem('rayanos-snake-best', String(value));
            } catch {
              /* ignore */
            }
          }
          return value;
        });
        setFood(placeFood(next));
        return next;
      }
      next.pop();
      return next;
    });
  }, [food, best, placeFood]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(step, speed);
    return () => window.clearInterval(id);
  }, [running, step, speed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const map: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const next = map[e.key];
      if (next) {
        e.preventDefault();
        const current = queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : dirRef.current;
        // no instant reversal
        if (current.x + next.x === 0 && current.y + next.y === 0) return;
        queueRef.current.push(next);
        setDir(next);
        setRunning(true);
      }
      if (e.key === ' ') {
        e.preventDefault();
        setRunning((r) => !r);
      }
      if (e.key === 'r') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // keep pace with the score
  useEffect(() => {
    setSpeed(Math.max(58, 122 - Math.floor(score / 30) * 8));
  }, [score]);

  const pushToast = useOS((s) => s.pushToast);

  useEffect(() => {
    if (!over) return;
    pushToast({
      appId: 'snake',
      title: 'Game over',
      body: `Final score ${score}. Best on this machine: ${Math.max(best, score)}.`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  const W = COLS * CELL;
  const H = ROWS * CELL;

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <button className="tool-btn" onClick={() => setRunning((r) => !r)}>
          {running ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          {running ? 'Pause' : 'Play'}
        </button>
        <button className="tool-btn" onClick={reset}>
          <ResetIcon size={14} /> Restart
        </button>
        <span className="flex-1" />
        <span className="text-[11.5px] tabular-nums pr-1" style={{ color: 'var(--os-text-muted)' }}>
          Score {score}
        </span>
        <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--os-text-muted)' }}>
          Best {Math.max(best, score)}
        </span>
      </div>

      <div className="flex-1 grid place-items-center p-4 overflow-auto">
        <div className="relative rounded-xl overflow-hidden" style={{ boxShadow: '0 20px 50px -20px rgba(0,0,0,.6)' }}>
          <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="snakeG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c9cff" />
                <stop offset="100%" stopColor="#5c83ff" />
              </linearGradient>
              <pattern id="grid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
                <rect width={CELL} height={CELL} fill="#0b0f18" />
                <rect width={CELL} height={CELL} fill="none" stroke="#161c2b" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width={W} height={H} fill="url(#grid)" />

            {/* food */}
            <g>
              <circle cx={food.x * CELL + CELL / 2} cy={food.y * CELL + CELL / 2} r={CELL / 2 - 3} fill="#ff5c7c" />
              <circle cx={food.x * CELL + CELL / 2 - 2} cy={food.y * CELL + CELL / 2 - 2} r={2} fill="#fff" opacity="0.6" />
            </g>

            {/* snake */}
            {snake.map((s, i) => (
              <rect
                key={`${s.x}-${s.y}-${i}`}
                x={s.x * CELL + 1.5}
                y={s.y * CELL + 1.5}
                width={CELL - 3}
                height={CELL - 3}
                rx={i === 0 ? 7 : 5}
                fill={i === 0 ? 'url(#snakeG)' : '#4a6ae0'}
                opacity={i === 0 ? 1 : Math.max(0.34, 1 - i * 0.035)}
              />
            ))}
          </svg>

          {(!running || over) && (
            <div className="absolute inset-0 grid place-items-center" style={{ background: 'rgba(6,9,16,.68)', backdropFilter: 'blur(3px)' }}>
              <div className="text-center text-white px-6">
                {over ? (
                  <>
                    <p className="text-[18px] font-semibold">Game over</p>
                    <p className="text-[12.5px] opacity-75 mt-1">
                      You scored {score}. {score > best - 1 ? 'New best.' : `Best is ${best}.`}
                    </p>
                    <button
                      className="mt-3.5 h-9 px-4 rounded-lg text-[12.5px] font-medium"
                      style={{ background: 'var(--os-accent)' }}
                      onClick={reset}
                    >
                      Play again
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[18px] font-semibold">Wormhole</p>
                    <p className="text-[12.5px] opacity-75 mt-1.5 max-w-[34ch]">
                      Arrow keys or WASD to steer. Space pauses. R restarts. The walls wrap, so you can only lose to
                      yourself.
                    </p>
                    <button
                      className="mt-3.5 h-9 px-4 rounded-lg text-[12.5px] font-medium"
                      style={{ background: 'var(--os-accent)' }}
                      onClick={() => setRunning(true)}
                    >
                      Start
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between px-4 h-8 text-[11px]" style={{ borderTop: '1px solid var(--os-border)', color: 'var(--os-text-muted)' }}>
        <span>Walls wrap · speed increases with score</span>
        <span>Best {Math.max(best, score)}</span>
      </div>
    </div>
  );
}
