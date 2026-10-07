export interface Project {
  id: string;
  name: string;
  kind: string;
  year: string;
  role: string;
  tagline: string;
  summary: string;
  problem: string;
  approach: string[];
  outcome: string[];
  stack: string[];
  image: string;
  accent: string;
  size: 'wide' | 'tall' | 'normal';
  link?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: 'cadence',
    name: 'Cadence',
    kind: 'Design system',
    year: '2024 — 2025',
    role: 'Lead engineer & system author',
    tagline: 'A 210-component design system that four product teams actually adopted.',
    summary:
      'A token-first design system for a fintech platform: primitives, patterns, documentation and a migration path that did not stop roadmap work.',
    problem:
      'Four product teams had drifted into four visual languages. Contrast failures were shipping weekly, dark mode was hand-rolled nine different ways, and every new screen cost about a week of design review.',
    approach: [
      'Started from measurements: audited 1,400 screens for spacing, type and colour outliers before writing a line of library code.',
      'Built tokens as a single source of truth, compiled outward to CSS custom properties, Tailwind theme and native.',
      'Shipped primitives with keyboard behaviour and focus management included, so accessibility was the default path rather than a ticket.',
      'Wrote a codemod for the 1,400 screens, then deleted the old component folder so nothing could creep back.',
    ],
    outcome: [
      'Adoption reached 92% of product surfaces within two quarters.',
      'Automated contrast checks removed a recurring weekly defect class.',
      'New screen build time fell from roughly five days to under two.',
    ],
    stack: ['React', 'TypeScript', 'Tailwind', 'Style Dictionary', 'Radix'],
    image: 'cadence-design-system.jpg',
    accent: '#5c83ff',
    size: 'wide',
    link: 'https://example.com/',
    featured: true,
  },
  {
    id: 'trellis',
    name: 'Trellis',
    kind: 'Developer tooling',
    year: '2025',
    role: 'Designer & engineer',
    tagline: 'Branch-aware preview environments for static sites, in about nine seconds.',
    summary:
      'A preview engine that spins a real URL for every branch, diffs the built output against the base branch, and comments the payload delta on the pull request.',
    problem:
      'Reviewers were approving layout changes they had never seen rendered, on builds nobody could reproduce locally without four undocumented steps.',
    approach: [
      'Streamed build artifacts instead of archiving them, which removed most of the latency.',
      'Diffed rendered DOM trees rather than source, so review comments described what changed visually.',
      'Kept every preview behind an expiring URL with its own isolated asset graph.',
    ],
    outcome: [
      'Median time from push to previewable URL: 8.6 seconds.',
      'Visual regressions caught before merge rose from 34% to 78%.',
      'Reproducing a bug locally went from fourteen steps to one command.',
    ],
    stack: ['Rust', 'Node.js', 'Vite', 'Cloudflare Workers', 'SQLite'],
    image: 'trellis-preview-engine.jpg',
    accent: '#12a5a5',
    size: 'normal',
    link: 'https://example.com/',
    featured: true,
  },
  {
    id: 'palette',
    name: 'Palette',
    kind: 'Tooling',
    year: '2024',
    role: 'Creator',
    tagline: 'A token pipeline that keeps Figma and shipped CSS in agreement.',
    summary:
      'Figma variables to code, with naming enforcement, contrast validation and a diff view showing exactly what a token change will touch.',
    problem:
      'Designers changed a variable on Tuesday. Six weeks later a developer noticed the site had quietly shifted hue.',
    approach: [
      'Pulled variables through the Figma REST API into a typed intermediate representation.',
      'Validated every pairing against WCAG AA before it was allowed to compile.',
      'Emitted a reviewable diff so token changes arrived as a pull request, not a surprise.',
    ],
    outcome: ['Design-to-code drift effectively stopped.', 'Contrast failures caught pre-merge: 100% of the sampled quarter.'],
    stack: ['TypeScript', 'Figma API', 'Node.js', 'GitHub Actions'],
    image: 'palette-token-pipeline.jpg',
    accent: '#a35bd4',
    size: 'normal',
    featured: false,
  },
  {
    id: 'ledgerly',
    name: 'Ledgerly',
    kind: 'Product',
    year: '2023',
    role: 'Product engineer',
    tagline: 'Multi-currency bookkeeping for freelancers who hate bookkeeping.',
    summary:
      'A ledger app built around one screen: what came in, what went out, and what it actually means after conversion fees.',
    problem:
      'Existing tools assumed a single currency and a finance department. Freelancers billing in three currencies got wrong numbers and gave up.',
    approach: [
      'Modelled every entry as a double-entry pair so balances could never drift, no matter the currency.',
      'Made the week view the default surface and the chart secondary.',
      'Snapshotted exchange rates per entry, so history never silently rewrote itself.',
    ],
    outcome: ['Retained 61% of trial users past week four.', 'Average time to first reconciled month: 11 minutes.'],
    stack: ['React', 'TypeScript', 'PostgreSQL', 'tRPC'],
    image: 'ledgerly-multicurrency-ledger.jpg',
    accent: '#4f9d5a',
    size: 'normal',
    featured: false,
  },
  {
    id: 'rickshaw',
    name: 'Rickshaw',
    kind: 'Civic tech',
    year: '2022',
    role: 'Volunteer project lead',
    tagline: 'Offline-first transit routing for a city that redesigns its roads often.',
    summary:
      'A progressive web app that works with no signal, stores a whole network graph in fifty kilobytes, and updates over the air.',
    problem:
      'Transit apps in Lahore assumed good connectivity. Riders on the metro corridor often had neither signal nor battery.',
    approach: [
      'Compressed the network graph into a compact binary format loadable offline.',
      'Ran routing entirely on the device — no network round trip, no server bill.',
      'Shipped in Urdu and English with large touch targets for one-handed use.',
    ],
    outcome: ['Works fully offline after first load.', 'Cold start to first route on a mid-range Android: 1.4s.'],
    stack: ['TypeScript', 'Service Workers', 'IndexedDB', 'WebAssembly'],
    image: 'rickshaw-transit-routing.jpg',
    accent: '#e2603b',
    size: 'normal',
    featured: false,
  },
  {
    id: 'quiet-hours',
    name: 'Quiet Hours',
    kind: 'Small software',
    year: '2023',
    role: 'Creator',
    tagline: 'A focus timer that respects the fact that you are already tired.',
    summary: 'Six hundred lines, no account, no analytics, no dashboard. It dims the screen and counts down.',
    problem: 'Every focus tool wanted an account, a streak, a leaderboard and an email digest. People just wanted a timer.',
    approach: [
      'One screen, three keys, zero configuration beyond a duration.',
      'Stored everything locally; nothing leaves the device.',
      'Wrote it as a single HTML file so it works from a USB stick.',
    ],
    outcome: ['Used by roughly 9,000 people, mostly quietly.', 'Lighthouse score of 100 on every axis.'],
    stack: ['Vanilla JS', 'CSS', 'Service Worker'],
    image: 'quiet-hours-focus-timer.jpg',
    accent: '#7c9cff',
    size: 'normal',
    featured: false,
  },
  {
    id: 'atlas-type',
    name: 'Atlas Type',
    kind: 'Editor tooling',
    year: '2026',
    role: 'Creator',
    tagline: 'A specimen tool for variable fonts that respects your keyboard.',
    summary:
      'Drag through axes, compare instances side by side, copy the resulting CSS, and export a specimen sheet as a PDF.',
    problem: 'Variable fonts are shipped with axes nobody can see. Designers were guessing at values and writing them by hand.',
    approach: [
      'Mapped every axis to a keyboard-adjustable control with a live numeric readout.',
      'Rendered with the actual font binary, not a screenshot, so it stays crisp at any size.',
      'Added a comparison rail that pins up to four instances for side-by-side judgement.',
    ],
    outcome: ['In daily use by three type foundries during testing.', 'Specimen export reduced a manual task from an hour to under a minute.'],
    stack: ['React', 'TypeScript', 'Canvas', 'OPFS'],
    image: 'atlas-type-specimen-tool.jpg',
    accent: '#d4a12f',
    size: 'normal',
    featured: true,
  },
  {
    id: 'loom',
    name: 'Loom Notes',
    kind: 'Product',
    year: '2021',
    role: 'Design & front-end',
    tagline: 'Frame-accurate review notes for people who review video all day.',
    summary: 'Comments pinned to timecode, grouped by scene, exportable as a shot list.',
    problem: 'Feedback arrived as a wall of timestamps in a chat thread and got lost within a day.',
    approach: [
      'Anchored every comment to a frame range, not a timestamp, so re-cuts kept their notes.',
      'Grouped by scene and let reviewers resolve threads inline.',
      'Exported straight into the editing software as markers.',
    ],
    outcome: ['Review turnaround on a 40-episode series fell from nine days to four.'],
    stack: ['React', 'TypeScript', 'WebCodecs', 'Node.js'],
    image: 'loom-notes-video-review.jpg',
    accent: '#d4568f',
    size: 'normal',
    featured: false,
  },
];

export const projectFilters = ['All', 'Design system', 'Tooling', 'Developer tooling', 'Product', 'Civic tech', 'Editor tooling', 'Small software'];

/* ------------------------------------------------------------------ */

export interface GalleryShot {
  id: string;
  file: string;
  caption: string;
  place: string;
  year: string;
  tall?: boolean;
}

export const gallery: GalleryShot[] = [
  {
    id: 'portrait',
    file: 'portrait-studio-lahore.jpg',
    caption: 'Portrait taken at the studio desk, late afternoon light from the east window.',
    place: 'Lahore',
    year: '2026',
    tall: true,
  },
  {
    id: 'desk',
    file: 'workshop-desk-setup.jpg',
    caption: 'The desk. Two keyboards, one very old lamp, and a stack of index cards that never gets smaller.',
    place: 'Studio Meridian',
    year: '2026',
  },
  {
    id: 'wireframes',
    file: 'wireframe-wall-exploration.jpg',
    caption: 'Ninety-one paper wireframes for the shipment table, taped to a wall for a fortnight.',
    place: 'Karachi',
    year: '2022',
  },
  {
    id: 'talk',
    file: 'conference-talk-interface-decisions.jpg',
    caption: 'Talking about defaults to four hundred people, hoping the demo would behave.',
    place: 'Islamabad',
    year: '2025',
    tall: true,
  },
  {
    id: 'type',
    file: 'typography-specimen-study.jpg',
    caption: 'Specimen studies for Atlas Type. Roughly the two hundredth iteration of one letterform.',
    place: 'Lahore',
    year: '2026',
  },
  {
    id: 'city',
    file: 'lahore-rooftop-evening.jpg',
    caption: 'Rooftop at golden hour. Most good ideas arrive here, which is inconvenient.',
    place: 'Lahore',
    year: '2025',
  },
  {
    id: 'prototype',
    file: 'hardware-prototype-bench.jpg',
    caption: 'Bench work on a display prototype that never became a product, but taught me a lot about latency.',
    place: 'Lahore',
    year: '2024',
  },
];
