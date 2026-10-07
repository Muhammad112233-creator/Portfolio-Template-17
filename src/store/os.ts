import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type AppId =
  | 'welcome'
  | 'browser'
  | 'explorer'
  | 'resume'
  | 'works'
  | 'gallery'
  | 'studio'
  | 'notes'
  | 'terminal'
  | 'settings'
  | 'store'
  | 'wall'
  | 'snake'
  | 'contact'
  | 'calculator'
  | 'notepad';

export type BootPhase = 'boot' | 'lock' | 'desktop' | 'sleeping' | 'shutdown';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  rect: Rect;
  restore?: Rect;
  z: number;
  minimized: boolean;
  maximized: boolean;
  loading: boolean;
  payload?: Record<string, unknown>;
}

export interface Toast {
  id: string;
  appId: AppId;
  title: string;
  body: string;
  time: number;
  read: boolean;
}

export interface WallPost {
  id: string;
  name: string;
  text: string;
  at: number;
  color: string;
}

export interface AccentOption {
  id: string;
  label: string;
  hex: string;
}

export const ACCENTS: AccentOption[] = [
  { id: 'iris', label: 'Iris', hex: '#5c83ff' },
  { id: 'cobalt', label: 'Cobalt', hex: '#2f6df6' },
  { id: 'teal', label: 'Teal', hex: '#12a5a5' },
  { id: 'plum', label: 'Plum', hex: '#a35bd4' },
  { id: 'ember', label: 'Ember', hex: '#e2603b' },
  { id: 'moss', label: 'Moss', hex: '#4f9d5a' },
];

export const WALLPAPERS = [
  { id: 'ridge', label: 'Blue Ridge', file: 'ridge.jpg' },
  { id: 'aurora', label: 'Aurora Drift', file: 'aurora.jpg' },
  { id: 'terrace', label: 'Monsoon Terrace', file: 'terrace.jpg' },
  { id: 'paper', label: 'Paper Bloom', file: 'paper.jpg' },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]['id'];

/* ------------------------------------------------------------------ *
 * Store
 * ------------------------------------------------------------------ */

interface OSState {
  /* shell lifecycle */
  phase: BootPhase;
  bootStep: number;
  booted: boolean;

  /* shell ui */
  startOpen: boolean;
  searchOpen: boolean;
  taskViewOpen: boolean;
  quickOpen: boolean;
  trayOpen: boolean;
  widgetsOpen: boolean;
  focusMode: boolean;
  desktopSelected: string | null;

  /* personalisation */
  theme: 'light' | 'dark';
  accent: string;
  wallpaper: WallpaperId;

  /* quick settings */
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  nightLight: boolean;
  brightness: number;
  volume: number;
  muted: boolean;
  battery: number;
  charging: boolean;

  /* windows */
  windows: WindowInstance[];
  zTop: number;
  nextId: number;

  /* content */
  toasts: Toast[];
  wall: WallPost[];
  notes: string;
  clock: number;

  /* actions — shell */
  setPhase: (p: BootPhase) => void;
  advanceBoot: () => void;
  completeBoot: () => void;

  toggleStart: (v?: boolean) => void;
  toggleSearch: (v?: boolean) => void;
  toggleTaskView: (v?: boolean) => void;
  toggleQuick: (v?: boolean) => void;
  toggleTray: (v?: boolean) => void;
  toggleWidgets: (v?: boolean) => void;
  closeAllFlyouts: () => void;
  toggleFocus: (v?: boolean) => void;
  selectDesktopIcon: (id: string | null) => void;

  /* actions — personalisation */
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setAccent: (hex: string) => void;
  setWallpaper: (id: WallpaperId) => void;

  /* actions — quick settings */
  patchQuick: (p: Partial<Pick<OSState, 'wifi' | 'bluetooth' | 'airplane' | 'nightLight' | 'volume' | 'muted'>>) => void;
  setBrightness: (v: number) => void;
  setVolume: (v: number) => void;

  /* actions — windows */
  openApp: (appId: AppId, payload?: Record<string, unknown>, title?: string) => void;
  closeWindow: (id: string) => void;
  closeApp: (appId: AppId) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, rect: Rect) => void;
  minimizeAll: () => void;
  restoreApp: (appId: AppId) => void;
  clampWindows: () => void;

  /* actions — content */
  pushToast: (t: Omit<Toast, 'id' | 'time' | 'read'>) => void;
  readToasts: () => void;
  clearToasts: () => void;
  addWallPost: (name: string, text: string) => void;
  setNotes: (v: string) => void;
  tick: () => void;
}

const TASKBAR = 48;

/**
 * Window geometry that respects the viewport it is opening into. Small screens
 * get a window that fills the space minus a margin, desktop screens get a
 * comfortable centred size with a slight cascade so stacked windows stay legible.
 */
const initialRect = (index: number): Rect => {
  const vw = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 900 : window.innerHeight;

  const gutterX = vw < 720 ? 12 : 24;
  const maxW = Math.max(280, vw - gutterX * 2);
  const maxH = Math.max(260, vh - TASKBAR - gutterX);

  const w = Math.min(980, Math.max(300, vw * 0.62), maxW);
  const h = Math.min(660, Math.max(300, vh * 0.66), maxH);

  // cascade only when there is room for it
  const step = vw < 900 ? 0 : (index % 6) * 28;

  return {
    x: Math.round(Math.min(Math.max(gutterX, (vw - w) / 2 + step - 60), Math.max(gutterX, vw - w - gutterX))),
    y: Math.round(Math.min(Math.max(gutterX, (vh - h - TASKBAR) / 2 + step - 30), Math.max(gutterX, vh - h - TASKBAR - gutterX))),
    w: Math.round(w),
    h: Math.round(h),
  };
};

/** Keeps every window inside the viewport after a rotation or resize. */
const clampRect = (rect: Rect): Rect => {
  const vw = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 900 : window.innerHeight;
  const gutterX = vw < 720 ? 8 : 16;
  const maxW = Math.max(280, vw - gutterX * 2);
  const maxH = Math.max(240, vh - TASKBAR - gutterX);

  const w = Math.min(rect.w, maxW);
  const h = Math.min(rect.h, maxH);
  return {
    w: Math.round(w),
    h: Math.round(h),
    x: Math.round(Math.min(Math.max(gutterX >= 16 ? 0 : gutterX, rect.x), Math.max(0, vw - w - gutterX))),
    y: Math.round(Math.min(Math.max(0, rect.y), Math.max(0, vh - h - TASKBAR))),
  };
};

export const useOS = create<OSState>()(
  persist(
    (set, get) => ({
      phase: 'boot',
      bootStep: 0,
      booted: false,

      startOpen: false,
      searchOpen: false,
      taskViewOpen: false,
      quickOpen: false,
      trayOpen: false,
      widgetsOpen: false,
      focusMode: false,
      desktopSelected: null,

      theme: 'dark',
      accent: '#5c83ff',
      wallpaper: 'ridge',

      wifi: true,
      bluetooth: true,
      airplane: false,
      nightLight: false,
      brightness: 100,
      volume: 68,
      muted: false,
      battery: 86,
      charging: true,

      windows: [],
      zTop: 10,
      nextId: 1,

      toasts: [],
      wall: [
        {
          id: 'seed-1',
          name: 'Hira',
          text: 'The taskbar clock actually ticks. Small details like that are what sell the illusion.',
          at: Date.now() - 1000 * 60 * 62,
          color: '#5c83ff',
        },
        {
          id: 'seed-2',
          name: 'Daniyal',
          text: 'Opened the terminal expecting nothing and ended up reading the whole timeline. Nice touch.',
          at: Date.now() - 1000 * 60 * 26,
          color: '#12a5a5',
        },
        {
          id: 'seed-3',
          name: 'Anonymous',
          text: 'Try typing "help" in the terminal. Then try "coffee".',
          at: Date.now() - 1000 * 60 * 7,
          color: '#e2603b',
        },
      ],
      notes:
        'Notes app — press Ctrl+S any time.\n\nIdeas parked here:\n• Rewrite the case study for the layout engine\n• Record a 40s clip of the branch picker\n• Ask about the poster grid spacing on wide screens\n',
      clock: Date.now(),

      /* ---------------- shell ---------------- */

      setPhase: (p) => set({ phase: p }),

      advanceBoot: () => set((s) => ({ bootStep: s.bootStep + 1 })),

      completeBoot: () =>
        set({
          booted: true,
          bootStep: 3,
          phase: 'lock',
        }),

      toggleStart: (v) =>
        set((s) => {
          const next = v ?? !s.startOpen;
          return {
            startOpen: next,
            searchOpen: false,
            taskViewOpen: false,
            quickOpen: false,
            trayOpen: false,
            widgetsOpen: false,
          };
        }),

      toggleSearch: (v) =>
        set((s) => ({
          searchOpen: v ?? !s.searchOpen,
          startOpen: false,
          taskViewOpen: false,
          quickOpen: false,
          trayOpen: false,
        })),

      toggleTaskView: (v) =>
        set((s) => ({
          taskViewOpen: v ?? !s.taskViewOpen,
          startOpen: false,
          searchOpen: false,
          quickOpen: false,
          trayOpen: false,
          widgetsOpen: false,
        })),

      toggleQuick: (v) =>
        set((s) => ({
          quickOpen: v ?? !s.quickOpen,
          startOpen: false,
          trayOpen: false,
          searchOpen: false,
        })),

      toggleTray: (v) =>
        set((s) => ({ trayOpen: v ?? !s.trayOpen, quickOpen: false, startOpen: false })),

      toggleWidgets: (v) =>
        set((s) => ({ widgetsOpen: v ?? !s.widgetsOpen, startOpen: false, taskViewOpen: false })),

      closeAllFlyouts: () =>
        set({
          startOpen: false,
          searchOpen: false,
          taskViewOpen: false,
          quickOpen: false,
          trayOpen: false,
          widgetsOpen: false,
          desktopSelected: null,
        }),

      toggleFocus: (v) => set((s) => ({ focusMode: v ?? !s.focusMode })),

      selectDesktopIcon: (id) => set({ desktopSelected: id, startOpen: false, widgetsOpen: false }),

      /* ---------------- personalisation ---------------- */

      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setAccent: (hex) => set({ accent: hex }),
      setWallpaper: (id) => set({ wallpaper: id }),

      /* ---------------- quick settings ---------------- */

      patchQuick: (p) => set((s) => ({ ...s, ...p })),

      setBrightness: (v) => set({ brightness: v }),
      setVolume: (v) => set({ volume: v, muted: v === 0 }),

      /* ---------------- windows ---------------- */

      openApp: (appId, payload, title) => {
        const s = get();
        const existing = s.windows.find((w) => w.appId === appId && !w.payload?.detached);
        if (existing && !payload) {
          set({
            startOpen: false,
            searchOpen: false,
            taskViewOpen: false,
            windows: s.windows.map((w) =>
              w.id === existing.id ? { ...w, minimized: false, z: s.zTop + 1 } : w
            ),
            zTop: s.zTop + 1,
          });
          return;
        }
        const z = s.zTop + 1;
        const id = `${appId}-${s.nextId}`;
        set({
          windows: [
            ...s.windows,
            {
              id,
              appId,
              title: title ?? appId,
              rect: initialRect(s.windows.length),
              z,
              minimized: false,
              maximized: false,
              loading: true,
              payload,
            },
          ],
          zTop: z,
          nextId: s.nextId + 1,
          startOpen: false,
          searchOpen: false,
          taskViewOpen: false,
          widgetsOpen: false,
        });
        // brief "loading app..." state, mirrors a cold app launch
        window.setTimeout(() => {
          set((st) => ({ windows: st.windows.map((w) => (w.id === id ? { ...w, loading: false } : w)) }));
        }, 320);
      },

      closeWindow: (id) =>
        set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

      closeApp: (appId) => set((s) => ({ windows: s.windows.filter((w) => w.appId !== appId) })),

      focusWindow: (id) => {
        const s = get();
        const win = s.windows.find((w) => w.id === id);
        if (!win) return;
        if (win.z === s.zTop && !win.minimized) return;
        const z = s.zTop + 1;
        set({
          windows: s.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
          zTop: z,
          startOpen: false,
          quickOpen: false,
          trayOpen: false,
        });
      },

      minimizeWindow: (id) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),

      toggleMaximize: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => {
            if (w.id !== id) return w;
            if (w.maximized && w.restore) {
              return { ...w, maximized: false, rect: w.restore, restore: w.rect };
            }
            const vw = window.innerWidth;
            const vh = window.innerHeight - TASKBAR;
            return {
              ...w,
              maximized: true,
              restore: w.rect,
              rect: { x: 0, y: 0, w: vw, h: vh },
            };
          }),
        })),

      moveWindow: (id, x, y) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, rect: { ...w.rect, x, y } } : w)),
        })),

      resizeWindow: (id, rect) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, rect } : w)) })),

      minimizeAll: () =>
        set((s) => ({ windows: s.windows.map((w) => ({ ...w, minimized: true })), taskViewOpen: false })),

      clampWindows: () =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.maximized
              ? { ...w, rect: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - TASKBAR } }
              : { ...w, rect: clampRect(w.rect), restore: w.restore ? clampRect(w.restore) : undefined }
          ),
        })),

      restoreApp: (appId) =>
        set((s) => {
          const z = s.zTop + 1;
          return {
            windows: s.windows.map((w) => (w.appId === appId ? { ...w, minimized: false, z } : w)),
            zTop: z,
          };
        }),

      /* ---------------- content ---------------- */

      pushToast: (t) =>
        set((s) => ({
          toasts: [
            { ...t, id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: Date.now(), read: false },
            ...s.toasts,
          ].slice(0, 24),
        })),

      readToasts: () => set((s) => ({ toasts: s.toasts.map((t) => ({ ...t, read: true })) })),

      clearToasts: () => set({ toasts: [] }),

      addWallPost: (name, text) =>
        set((s) => ({
          wall: [
            {
              id: `w-${Date.now()}`,
              name: name.trim() || 'Anonymous',
              text: text.trim(),
              at: Date.now(),
              color: ['#5c83ff', '#12a5a5', '#e2603b', '#a35bd4', '#4f9d5a'][s.wall.length % 5],
            },
            ...s.wall,
          ].slice(0, 60),
        })),

      setNotes: (v) => set({ notes: v }),

      tick: () =>
        set((s) => ({
          clock: Date.now(),
          battery: s.charging ? Math.min(100, s.battery + 0.02) : Math.max(3, s.battery - 0.01),
        })),
    }),
    {
      name: 'rayanos-shell-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        accent: s.accent,
        wallpaper: s.wallpaper,
        wifi: s.wifi,
        bluetooth: s.bluetooth,
        airplane: s.airplane,
        nightLight: s.nightLight,
        brightness: s.brightness,
        volume: s.volume,
        muted: s.muted,
        notes: s.notes,
        wall: s.wall,
        booted: true as boolean,
      }),
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
    }
  )
);

/* Convenience selectors ------------------------------------------- */

export const useTheme = () => useOS((s) => s.theme);
export const useWindows = () => useOS((s) => s.windows);
export const usePhase = () => useOS((s) => s.phase);
