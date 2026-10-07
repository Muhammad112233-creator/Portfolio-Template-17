import { useRef, useEffect, useState } from 'react';
import { useOS } from '../../store/os';
import { StatusGlyphs } from '../../lib/icons';

const { play: Play, pause: Pause, volume: Vol, refresh: Reset, spinner: Spin } = StatusGlyphs;

/* Musical definitions — a pentatonic bed plus two pad voices. */

const SCALE = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

interface Voice {
  id: string;
  name: string;
  kind: 'pad' | 'arp' | 'bass' | 'noise';
  color: string;
  gain: number;
}

const VOICES: Voice[] = [
  { id: 'pad', name: 'Warm pad', kind: 'pad', color: '#7c9cff', gain: 0.16 },
  { id: 'arp', name: 'Glass arp', kind: 'arp', color: '#12a5a5', gain: 0.1 },
  { id: 'bass', name: 'Sub bass', kind: 'bass', color: '#a35bd4', gain: 0.14 },
  { id: 'air', name: 'Room air', kind: 'noise', color: '#e2603b', gain: 0.03 },
];

export function StudioApp() {
  const volume = useOS((s) => s.volume);
  const muted = useOS((s) => s.muted);
  const pushToast = useOS((s) => s.pushToast);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timersRef = useRef<number[]>([]);
  const nodesRef = useRef<AudioNode[]>([]);

  const [playing, setPlaying] = useState(false);
  const [levels, setLevels] = useState<Record<string, number>>({ pad: 0.5, arp: 0.4, bass: 0.35, air: 0.2 });
  const [bars, setBars] = useState<number[]>(new Array(28).fill(6));
  const [preset, setPreset] = useState<'Calm' | 'Focus' | 'Night'>('Calm');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (masterRef.current && ctxRef.current) {
      const target = muted ? 0 : (volume / 100) * 0.6;
      masterRef.current.gain.setTargetAtTime(target, ctxRef.current.currentTime, 0.08);
    }
  }, [volume, muted]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  // level meter, purely visual but driven by real gain values
  useEffect(() => {
    if (!playing) {
      setBars(new Array(28).fill(4));
      return;
    }
    const id = window.setInterval(() => {
      setBars(
        Array.from({ length: 28 }, (_, i) => {
          const base = (levels.pad * 40 + levels.arp * 30 + levels.bass * 26 + levels.air * 16);
          const wave = Math.sin((Date.now() / 260) + i * 0.55) * 0.5 + 0.5;
          const secondary = Math.sin((Date.now() / 90) + i * 1.9) * 0.28 + 0.28;
          return 6 + (base * (0.55 + wave * 0.5 + secondary * 0.35)) * (preset === 'Night' ? 0.7 : preset === 'Focus' ? 1.15 : 1);
        })
      );
    }, 78);
    return () => window.clearInterval(id);
  }, [playing, levels, preset]);

  const presetFor = (p: typeof preset) => {
    if (p === 'Focus') return { pad: 0.34, arp: 0.52, bass: 0.2, air: 0.1 };
    if (p === 'Night') return { pad: 0.6, arp: 0.16, bass: 0.48, air: 0.26 };
    return { pad: 0.5, arp: 0.4, bass: 0.35, air: 0.2 };
  };

  useEffect(() => {
    setLevels(presetFor(preset));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  function ensureContext() {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = muted ? 0 : (volume / 100) * 0.6;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return ctxRef.current;
  }

  function start() {
    const ctx = ensureContext();
    const master = masterRef.current!;
    if (ctx.state === 'suspended') void ctx.resume();

    const cleanup: AudioNode[] = [];
    const timers: number[] = [];

    const rev = ctx.createConvolver();
    const len = ctx.sampleRate * 2.4;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    rev.buffer = buf;
    const revGain = ctx.createGain();
    revGain.gain.value = 0.34;
    rev.connect(revGain).connect(master);
    cleanup.push(rev, revGain);

    // 1 — warm pad: two detuned saws through a slow filter sweep
    const padBus = ctx.createGain();
    padBus.gain.value = levels.pad;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 620;
    padFilter.Q.value = 0.7;
    padBus.connect(padFilter);
    padFilter.connect(master);
    padFilter.connect(rev);
    cleanup.push(padBus, padFilter);

    const padOscs: OscillatorNode[] = [];
    [261.63, 392.0].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      osc.detune.value = i === 0 ? -7 : 6;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g).connect(padBus);
      osc.start();
      padOscs.push(osc);
      cleanup.push(osc, g);
    });

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain).connect(padFilter.frequency);
    lfo.start();
    cleanup.push(lfo, lfoGain);

    // 2 — glass arp: triangle plucks on a pentatonic grid
    const arpBus = ctx.createGain();
    arpBus.gain.value = levels.arp;
    arpBus.connect(master);
    arpBus.connect(rev);
    cleanup.push(arpBus);

    const scheduleArp = () => {
      const note = SCALE[Math.floor(Math.random() * SCALE.length)] * (Math.random() > 0.72 ? 2 : 1);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = note;
      const env = ctx.createGain();
      const now = ctx.currentTime;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.5, now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 1.5);
      osc.connect(env).connect(arpBus);
      osc.start(now);
      osc.stop(now + 1.6);
      cleanup.push(osc, env);
      timers.push(window.setTimeout(scheduleArp, 340 + Math.random() * 620));
    };
    timers.push(window.setTimeout(scheduleArp, 240));

    // 3 — sub bass: a slow sine that follows a two-note loop
    const bassBus = ctx.createGain();
    bassBus.gain.value = levels.bass;
    bassBus.connect(master);
    cleanup.push(bassBus);

    const bassOsc = ctx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 65.41;
    const bassEnv = ctx.createGain();
    bassEnv.gain.value = 0.6;
    bassOsc.connect(bassEnv).connect(bassBus);
    bassOsc.start();
    cleanup.push(bassOsc, bassEnv);

    const bassSeq = [65.41, 65.41, 87.31, 73.42];
    let bassStep = 0;
    const bassTimer = window.setInterval(() => {
      bassStep = (bassStep + 1) % bassSeq.length;
      bassOsc.frequency.setTargetAtTime(bassSeq[bassStep], ctx.currentTime, 0.24);
    }, 2600);
    timers.push(bassTimer);

    // 4 — room air: filtered noise, very quiet
    const noiseLen = ctx.sampleRate * 3;
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.35;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 780;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = levels.air * 2.2;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.connect(noiseGain);
    noise.start();
    cleanup.push(noise, noiseFilter, noiseGain);

    nodesRef.current = cleanup;
    timersRef.current = timers;
    setPlaying(true);
  }

  function stop() {
    setPlaying(false);
    timersRef.current.forEach((t) => {
      window.clearTimeout(t);
      window.clearInterval(t);
    });
    timersRef.current = [];
    nodesRef.current.forEach((n) => {
      try {
        const maybe = n as unknown as { stop?: (t?: number) => void; disconnect?: () => void };
        maybe.stop?.();
        maybe.disconnect?.();
      } catch {
        /* already gone */
      }
    });
    nodesRef.current = [];
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="h-full flex flex-col">
      <div className="app-toolbar">
        <button
          className={`tool-btn ${playing ? 'tool-btn--on' : ''}`}
          onClick={() => (playing ? stop() : start())}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button className="tool-btn" onClick={stop} disabled={!playing} style={{ opacity: playing ? 1 : 0.45 }}>
          <Reset size={14} /> Stop
        </button>
        <span className="flex-1" />
        <span className="text-[11.5px] tabular-nums pr-1" style={{ color: 'var(--os-text-muted)' }}>
          {playing ? mmss : 'idle'}
        </span>
        <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--os-text-muted)' }}>
          <Vol size={13} /> {muted ? 'muted' : `${volume}%`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* visualiser */}
        <div
          className="rounded-xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(92,131,255,.16), rgba(163,91,212,.09) 52%, transparent)',
            border: '1px solid var(--os-border)',
          }}
        >
          <div className="flex items-end gap-[5px] h-[150px]">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full"
                style={{
                  height: `${Math.max(4, h)}px`,
                  background: `linear-gradient(180deg, var(--os-accent), ${i % 3 === 0 ? '#a35bd4' : '#2f6df6'})`,
                  opacity: playing ? 0.92 : 0.34,
                  transition: 'height .09s linear, opacity .3s ease',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-[15px] font-semibold">
                {preset === 'Calm' ? 'Ravi Morning' : preset === 'Focus' ? 'Deep Work' : 'Late Rooftop'}
              </p>
              <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--os-text-muted)' }}>
                Generative ambient · generated live in your browser
              </p>
            </div>
            <span className="pill">{playing ? 'Playing' : 'Stopped'}</span>
          </div>
        </div>

        {/* presets */}
        <div className="mt-5">
          <p className="text-[12.5px] font-semibold mb-2.5">Presets</p>
          <div className="flex gap-2">
            {(['Calm', 'Focus', 'Night'] as const).map((p) => (
              <button key={p} className={`chip ${preset === p ? '!border-[var(--os-accent)] !text-[var(--os-accent)]' : ''}`} onClick={() => setPreset(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* mixer */}
        <div className="mt-5 space-y-2.5">
          <p className="text-[12.5px] font-semibold">Mixer</p>
          {VOICES.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-xl p-3 panel">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
              <span className="text-[12.5px] w-[86px] shrink-0">{v.name}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(levels[v.id] * 100)}
                onChange={(e) => {
                  const value = Number(e.target.value) / 100;
                  setLevels((l) => ({ ...l, [v.id]: value }));
                  if (playing && v.id === 'pad' && nodesRef.current[2]) {
                    // live adjust where it is straightforward
                    try {
                      (nodesRef.current[2] as GainNode).gain.setTargetAtTime(value, ctxRef.current!.currentTime, 0.1);
                    } catch {
                      /* ignore */
                    }
                  }
                }}
                className="slider flex-1"
                style={{ ['--pct' as string]: `${Math.round(levels[v.id] * 100)}%` }}
                aria-label={`${v.name} level`}
              />
              <span className="text-[11px] tabular-nums w-8 text-right" style={{ color: 'var(--os-text-muted)' }}>
                {Math.round(levels[v.id] * 100)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl p-4 panel">
          <p className="text-[12.5px] font-semibold mb-2 flex items-center gap-2">
            <Spin size={13} /> How this works
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--os-text-muted)' }}>
            There is no audio file anywhere on this site. Every sound is synthesised live with the Web Audio API: two
            detuned oscillators through a slow filter sweep for the pad, a triangle arpeggio on a pentatonic grid,
            a sub-bass loop, and filtered noise for room air. The waveform in the middle is the real mixer state, not a
            looping picture.
          </p>
          <button
            className="mt-3 h-8 px-3 rounded-lg text-[12px] font-medium"
            style={{ background: 'color-mix(in srgb, var(--os-text) 8%, transparent)' }}
            onClick={() => {
              stop();
              pushToast({ appId: 'studio', title: 'Sound Lab', body: 'Audio stopped and every node released.' });
            }}
          >
            Release all audio nodes
          </button>
        </div>
      </div>
    </div>
  );
}
