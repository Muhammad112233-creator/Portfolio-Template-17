import type { AppId } from '../store/os';
import { APPS } from '../data/apps';
import { projects } from '../data/projects';
import { posts } from '../data/blog';
import { gallery } from '../data/projects';

export interface SearchHit {
  key: string;
  kind: 'app' | 'project' | 'post' | 'photo' | 'page';
  appId: AppId;
  title: string;
  sub: string;
  color?: string;
  payload?: Record<string, unknown>;
}

const PAGES: SearchHit[] = [
  { key: 'p-bio', kind: 'page', appId: 'browser', title: 'Biography', sub: 'The long version, in reading order', payload: { route: '/biography' } },
  { key: 'p-work', kind: 'page', appId: 'works', title: 'Selected work', sub: 'All eight case studies', payload: {} },
  { key: 'p-gal', kind: 'page', appId: 'gallery', title: 'Gallery', sub: 'Studio, travel and talk photos', payload: {} },
  { key: 'p-res', kind: 'page', appId: 'resume', title: 'Resume', sub: 'Experience, skills and education', payload: {} },
  { key: 'p-wri', kind: 'page', appId: 'browser', title: 'Writing', sub: 'Five essays on interface decisions', payload: { route: '/writing' } },
  { key: 'p-con', kind: 'page', appId: 'contact', title: 'Contact', sub: 'Email, socials and availability', payload: {} },
  { key: 'p-faq', kind: 'page', appId: 'browser', title: 'Frequently asked questions', sub: 'Who, what and how this was built', payload: { route: '/faq' } },
];

const APP_HITS: SearchHit[] = APPS.map((a) => ({
  key: `a-${a.id}`,
  kind: 'app',
  appId: a.id,
  title: a.name,
  sub: a.blurb,
}));

const PROJECT_HITS: SearchHit[] = projects.map((p) => ({
  key: `pr-${p.id}`,
  kind: 'project',
  appId: 'works',
  title: p.name,
  sub: `${p.kind} · ${p.year} — ${p.tagline}`,
  color: p.accent,
  payload: { projectId: p.id },
}));

const POST_HITS: SearchHit[] = posts.map((p) => ({
  key: `po-${p.slug}`,
  kind: 'post',
  appId: 'browser',
  title: p.title,
  sub: `${p.readTime} · ${p.tags.join(', ')}`,
  payload: { route: `/writing/${p.slug}` },
}));

const PHOTO_HITS: SearchHit[] = gallery.map((g) => ({
  key: `ph-${g.id}`,
  kind: 'photo',
  appId: 'gallery',
  title: g.caption.split('.')[0],
  sub: `${g.place} · ${g.year}`,
  payload: { photoId: g.id },
}));

const ALL = [...APP_HITS, ...PAGES, ...PROJECT_HITS, ...POST_HITS, ...PHOTO_HITS];

const DEFAULT_ORDER = ['welcome', 'works', 'resume', 'gallery', 'browser', 'terminal', 'studio', 'contact'];

export function searchIndex(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return DEFAULT_ORDER.map((id) => APP_HITS.find((h) => h.appId === id)).filter(Boolean) as SearchHit[];
  }

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = ALL.map((hit) => {
    const haystack = `${hit.title} ${hit.sub} ${hit.appId}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (hit.title.toLowerCase().startsWith(term)) score += 6;
      else if (hit.title.toLowerCase().includes(term)) score += 4;
      if (haystack.includes(term)) score += 2;
    }
    return { hit, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 14)
    .map((x) => x.hit);

  return scored;
}
