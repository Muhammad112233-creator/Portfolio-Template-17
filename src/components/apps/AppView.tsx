import type { AppId } from '../../store/os';
import { WelcomeApp } from './WelcomeApp';
import { BrowserApp } from './BrowserApp';
import { WorkbenchApp } from './WorkbenchApp';
import { ExplorerApp } from './ExplorerApp';
import { GalleryApp } from './GalleryApp';
import { ResumeApp } from './ResumeApp';
import { TerminalApp } from './TerminalApp';
import { SettingsApp } from './SettingsApp';
import { StudioApp } from './StudioApp';
import { NotesApp } from './NotesApp';
import { StoreApp } from './StoreApp';
import { WallApp } from './WallApp';
import { SnakeApp } from './SnakeApp';
import { ContactApp } from './ContactApp';
import { CalculatorApp } from './CalculatorApp';
import { StickyApp } from './StickyApp';

export function AppView({
  appId,
  payload,
  windowId,
}: {
  appId: AppId;
  payload?: Record<string, unknown>;
  windowId: string;
}) {
  switch (appId) {
    case 'welcome':
      return <WelcomeApp payload={payload} />;
    case 'browser':
      return <BrowserApp payload={payload} />;
    case 'works':
      return <WorkbenchApp payload={payload} />;
    case 'explorer':
      return <ExplorerApp />;
    case 'gallery':
      return <GalleryApp payload={payload} />;
    case 'resume':
      return <ResumeApp />;
    case 'terminal':
      return <TerminalApp />;
    case 'settings':
      return <SettingsApp payload={payload} />;
    case 'studio':
      return <StudioApp />;
    case 'notes':
      return <NotesApp />;
    case 'store':
      return <StoreApp />;
    case 'wall':
      return <WallApp />;
    case 'snake':
      return <SnakeApp />;
    case 'contact':
      return <ContactApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'notepad':
      return <StickyApp windowId={windowId} />;
    default:
      return (
        <div className="p-6 text-sm" style={{ color: 'var(--os-text-muted)' }}>
          This app is not installed yet.
        </div>
      );
  }
}
