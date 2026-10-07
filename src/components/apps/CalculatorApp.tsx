import { useEffect, useState } from 'react';
import { StatusGlyphs } from '../../lib/icons';

const { trash: TrashIcon } = StatusGlyphs;

type Op = '+' | '-' | '×' | '÷' | null;

const format = (n: number) => {
  if (!isFinite(n)) return 'Cannot divide by zero';
  return String(Math.round(n * 1e10) / 1e10);
};

export function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);
  const [tape, setTape] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);

  const inputDigit = (d: string) => {
    if (fresh) {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
      return;
    }
    if (d === '.' && display.includes('.')) return;
    setDisplay(display === '0' && d !== '.' ? d : display + d);
  };

  const apply = (a: number, b: number, o: Op): number => {
    switch (o) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const chooseOp = (next: Op) => {
    const current = Number(display);
    if (stored !== null && op && !fresh) {
      const result = apply(stored, current, op);
      setDisplay(format(result));
      setStored(result);
      setTape((t) => [`${stored} ${op} ${current} = ${format(result)}`, ...t].slice(0, 40));
    } else {
      setStored(current);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (stored === null || !op) return;
    const current = Number(display);
    const result = apply(stored, current, op);
    setTape((t) => [`${stored} ${op} ${current} = ${format(result)}`, ...t].slice(0, 40));
    setDisplay(format(result));
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay('0');
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const unary = (kind: 'sqrt' | 'sq' | 'inv' | 'neg' | 'pct') => {
    const v = Number(display);
    const r =
      kind === 'sqrt' ? Math.sqrt(v) : kind === 'sq' ? v * v : kind === 'inv' ? 1 / v : kind === 'neg' ? -v : v / 100;
    setTape((t) => [`${kind}(${v}) = ${format(r)}`, ...t].slice(0, 40));
    setDisplay(format(r));
    setFresh(true);
  };

  /* keyboard support, ignoring fields elsewhere in the shell */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (/^[0-9.]$/.test(e.key)) inputDigit(e.key);
      else if (e.key === '+') chooseOp('+');
      else if (e.key === '-') chooseOp('-');
      else if (e.key === '*') chooseOp('×');
      else if (e.key === '/') {
        e.preventDefault();
        chooseOp('÷');
      } else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Escape') clear();
      else if (e.key === 'Backspace') setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const keys: { label: string; onClick: () => void; variant?: 'op' | 'fn' }[] = [
    { label: 'C', onClick: clear, variant: 'fn' },
    { label: '±', onClick: () => unary('neg'), variant: 'fn' },
    { label: '%', onClick: () => unary('pct'), variant: 'fn' },
    { label: '√', onClick: () => unary('sqrt'), variant: 'fn' },
    { label: '7', onClick: () => inputDigit('7') },
    { label: '8', onClick: () => inputDigit('8') },
    { label: '9', onClick: () => inputDigit('9') },
    { label: '÷', onClick: () => chooseOp('÷'), variant: 'op' },
    { label: '4', onClick: () => inputDigit('4') },
    { label: '5', onClick: () => inputDigit('5') },
    { label: '6', onClick: () => inputDigit('6') },
    { label: '×', onClick: () => chooseOp('×'), variant: 'op' },
    { label: '1', onClick: () => inputDigit('1') },
    { label: '2', onClick: () => inputDigit('2') },
    { label: '3', onClick: () => inputDigit('3') },
    { label: '-', onClick: () => chooseOp('-'), variant: 'op' },
    { label: '0', onClick: () => inputDigit('0') },
    { label: '.', onClick: () => inputDigit('.') },
    { label: 'x²', onClick: () => unary('sq'), variant: 'fn' },
    { label: '+', onClick: () => chooseOp('+'), variant: 'op' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <span className="text-[12px] pl-1" style={{ color: 'var(--os-text-muted)' }}>
          Standard
        </span>
        <span className="flex-1" />
        <button className="tool-btn" onClick={() => setMemory(Number(display))} title="Store in memory">
          MS
        </button>
        <button className="tool-btn" onClick={() => setDisplay(format(memory))} title="Recall memory">
          MR
        </button>
        <button className="tool-btn" onClick={() => setMemory(0)} title="Clear memory">
          MC
        </button>
      </div>

      <div className="px-4 pt-4 pb-3">
        <div className="text-right">
          <p className="text-[11px] h-4 truncate" style={{ color: 'var(--os-text-muted)' }}>
            {memory !== 0 ? `M ${memory}` : ''} {stored !== null ? `${stored} ${op ?? ''}` : ''}
          </p>
          <p className="text-[34px] font-light leading-tight tabular-nums break-all">{display}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-2 px-4 pb-3" style={{ gridAutoRows: '1fr', minHeight: 0 }}>
        {keys.map((k) => (
          <button
            key={k.label}
            onClick={k.onClick}
            className="rounded-lg text-[16px] font-medium transition-transform active:scale-[0.96]"
            style={{
              background:
                k.variant === 'op'
                  ? 'color-mix(in srgb, var(--os-accent) 20%, transparent)'
                  : k.variant === 'fn'
                    ? 'color-mix(in srgb, var(--os-text) 9%, transparent)'
                    : 'color-mix(in srgb, var(--os-text) 5%, transparent)',
              color: k.variant === 'op' ? 'var(--os-accent)' : 'var(--os-text)',
            }}
          >
            {k.label}
          </button>
        ))}
        <button
          onClick={equals}
          className="col-span-4 rounded-lg text-[16px] font-medium text-white transition-transform active:scale-[0.98]"
          style={{ background: 'var(--os-accent)' }}
        >
          =
        </button>
      </div>

      <div className="shrink-0 border-t px-3 py-2 max-h-[112px] overflow-y-auto" style={{ borderColor: 'var(--os-border)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--os-text-muted)' }}>
            Tape
          </span>
          {tape.length > 0 && (
            <button className="text-[10.5px] flex items-center gap-1" style={{ color: 'var(--os-text-muted)' }} onClick={() => setTape([])}>
              <TrashIcon size={11} /> Clear
            </button>
          )}
        </div>
        {tape.length === 0 ? (
          <p className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
            Calculations appear here. Keyboard works too.
          </p>
        ) : (
          tape.map((t, i) => (
            <p key={i} className="text-[11.5px] tabular-nums" style={{ opacity: Math.max(0.4, 1 - i * 0.12) }}>
              {t}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
