import type { ReactNode } from 'react';
import {
  Sparkles,
  Globe,
  Folder,
  Layers,
  Image as ImageIcon,
  AudioWaveform,
  Terminal as TerminalIcon,
  FileText,
  NotebookPen,
  ShoppingBag,
  MessageSquareHeart,
  Gamepad2,
  Send,
  Calculator,
  StickyNote,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  Bluetooth,
  Plane,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  BatteryFull,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Bell,
  Search,
  LayoutGrid,
  Minus,
  Square,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
  Mail,
  MapPin,
  Clock,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Mic,
  Maximize2,
  Menu,
  Filter,
  Grid2x2,
  List,
  ZoomIn,
  Info,
  Power,
  Loader2,
  Heart,
  Send as SendIcon,
  Calendar,
  Cloud,
  Coffee,
  type LucideIcon,
} from 'lucide-react';
import type { AppId } from '../store/os';
import { appById } from '../data/apps';

/* ------------------------------------------------------------------ *
 * App icon glyph map
 * ------------------------------------------------------------------ */

const GLYPHS: Record<AppId, LucideIcon> = {
  welcome: Sparkles,
  browser: Globe,
  explorer: Folder,
  works: Layers,
  gallery: ImageIcon,
  studio: AudioWaveform,
  terminal: TerminalIcon,
  resume: FileText,
  notes: NotebookPen,
  store: ShoppingBag,
  wall: MessageSquareHeart,
  snake: Gamepad2,
  contact: Send,
  calculator: Calculator,
  notepad: StickyNote,
  settings: SettingsIcon,
};

export const glyphFor = (id: AppId) => GLYPHS[id] ?? Sparkles;

/**
 * Renders an application icon: a rounded gradient tile with a glyph, gloss
 * highlight and drop shadow. Drawn in CSS/SVG rather than bitmap files so it
 * stays crisp at every size and adds nothing to the network graph.
 */
export function AppIcon({
  id,
  size = 34,
  radius,
  className = '',
}: {
  id: AppId;
  size?: number;
  radius?: number;
  className?: string;
}) {
  const def = appById(id);
  const Glyph = glyphFor(id);
  const r = radius ?? Math.round(size * 0.24);
  const color = def?.color ?? '#5c83ff';

  return (
    <span
      className={`relative inline-grid place-items-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: `linear-gradient(150deg, ${shade(color, 26)} 0%, ${color} 52%, ${shade(color, -22)} 100%)`,
        boxShadow: `0 1px 2px rgba(0,0,0,.28), 0 ${Math.round(size * 0.09)}px ${Math.round(
          size * 0.24
        )}px -${Math.round(size * 0.1)}px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.42)`,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '48%',
          background: 'linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,0))',
        }}
      />
      <Glyph
        size={Math.round(size * 0.54)}
        strokeWidth={1.9}
        color="#fff"
        style={{ position: 'relative', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.28))' }}
      />
    </span>
  );
}

/** Small file/folder tiles for Explorer, which should not look like apps. */
export function FileGlyph({ kind, size = 30 }: { kind: string; size?: number }) {
  const map: Record<string, { icon: LucideIcon; color: string }> = {
    folder: { icon: Folder, color: '#e0a63a' },
    code: { icon: FileText, color: '#2f6df6' },
    doc: { icon: FileText, color: '#4f9d5a' },
    image: { icon: ImageIcon, color: '#d4568f' },
    audio: { icon: AudioWaveform, color: '#a35bd4' },
    archive: { icon: Folder, color: '#8a8f99' },
    sheet: { icon: FileText, color: '#4f9d5a' },
    app: { icon: Layers, color: '#5c83ff' },
  };
  const { icon: Icon, color } = map[kind] ?? map.doc;
  return (
    <span
      className="inline-grid place-items-center shrink-0"
      style={{ width: size, height: size, opacity: 0.95 }}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={1.6} color={color} />
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Theme / status glyphs
 * ------------------------------------------------------------------ */

export const StatusGlyphs = {
  wifi: Wifi,
  wifiOff: WifiOff,
  bluetooth: Bluetooth,
  airplane: Plane,
  moon: Moon,
  sun: Sun,
  volume: Volume2,
  mute: VolumeX,
  bell: Bell,
  search: Search,
  grid: LayoutGrid,
  minimize: Minus,
  maximize: Square,
  close: X,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  play: Play,
  pause: Pause,
  copy: Copy,
  check: Check,
  external: ExternalLink,
  github: Github,
  linkedin: Linkedin,
  x: Twitter,
  dribbble: Dribbble,
  mail: Mail,
  pin: MapPin,
  clock: Clock,
  star: Star,
  briefcase: Briefcase,
  education: GraduationCap,
  award: Award,
  wrench: Wrench,
  trash: Trash2,
  plus: Plus,
  refresh: RefreshCw,
  download: Download,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  mic: Mic,
  expand: Maximize2,
  menu: Menu,
  filter: Filter,
  gridView: Grid2x2,
  listView: List,
  zoom: ZoomIn,
  info: Info,
  power: Power,
  spinner: Loader2,
  heart: Heart,
  send: SendIcon,
  calendar: Calendar,
  cloud: Cloud,
  coffee: Coffee,
  settings: SettingsIcon,
  terminal: TerminalIcon,
  fileText: FileText,
};

export function BatteryGlyph({ level, charging }: { level: number; charging: boolean }) {
  if (charging) return <BatteryCharging size={16} strokeWidth={1.7} />;
  if (level > 60) return <BatteryFull size={16} strokeWidth={1.7} />;
  if (level > 25) return <BatteryMedium size={16} strokeWidth={1.7} />;
  return <BatteryLow size={16} strokeWidth={1.7} />;
}

export function Glyph({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center justify-center">{children}</span>;
}

/* ------------------------------------------------------------------ *
 * Colour helpers
 * ------------------------------------------------------------------ */

function shade(hex: string, amount: number) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const num = parseInt(full, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function withAlpha(hex: string, alpha: number) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const num = parseInt(full, 16);
  return `rgba(${num >> 16}, ${(num >> 8) & 0xff}, ${num & 0xff}, ${alpha})`;
}
