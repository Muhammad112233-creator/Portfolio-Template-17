/* ------------------------------------------------------------------ *
 * Site content
 * Everything the shell renders lives here so the whole portfolio can be
 * re-skinned by editing these objects.
 * ------------------------------------------------------------------ */

export const profile = {
  name: 'Rayan Malik',
  shortName: 'Rayan',
  alias: ['Rayan', 'R. Malik'],
  role: 'Product Engineer',
  roleSecondary: 'Interface Designer',
  tagline: 'I build interfaces that feel like tools, not brochures.',
  location: 'Lahore, Pakistan',
  timezone: 'PKT · UTC+5',
  birthDate: '1996-04-18',
  email: 'hello@example.com',
  phone: '+92 300 0000000',
  availability: 'Open to product engineering roles and 2–3 week interface contracts',
  summary:
    'Rayan Malik is a product engineer and interface designer based in Lahore, Pakistan. He works on editor tooling, design systems and the unglamorous parts of the web that decide whether a product feels fast — state models, keyboard paths, and the spacing between things.',
  longBio: [
    'Rayan Malik is a product engineer and interface designer based in Lahore, Pakistan. Born in 1996, he started out building WordPress themes for local studios and slowly moved down the stack until he was writing the component libraries those themes were made of.',
    'His work sits in the seam between design and engineering. He has shipped design systems used by teams of forty, rebuilt a document editor\'s state model so that undo stopped eating keystrokes, and spent eleven months on a token pipeline that keeps Figma variables and shipped CSS in agreement.',
    'He runs a small practice called Studio Meridian, works mostly in React, TypeScript and Rust, and writes about interface decisions that nobody notices until they are wrong. When he is not working he is usually sketching letterforms, flying a drone over the Ravi, or losing at carrom.',
  ],
  currentFocus: 'A branch-aware preview engine for static sites, and a variable-font specimen tool.',
  values: [
    {
      title: 'Latency is a design material',
      body: 'A 90ms interaction and a 400ms one are different products. I treat response time as something you design with, not something you fix later.',
    },
    {
      title: 'Keyboard first, mouse second',
      body: 'If a workflow cannot be driven from the keyboard, it is not finished. Power paths should not be hidden behind a menu.',
    },
    {
      title: 'Boring where it counts',
      body: 'State management and data models should be dull and predictable. Save the invention for the surface people actually touch.',
    },
  ],
  stats: [
    { label: 'Years shipping', value: '9' },
    { label: 'Systems built', value: '14' },
    { label: 'Components authored', value: '210+' },
    { label: 'Cities worked from', value: '6' },
  ],
  socials: [
    { id: 'github', label: 'GitHub', handle: '@rayanmalik', url: 'https://github.com/' },
    { id: 'linkedin', label: 'LinkedIn', handle: '/in/rayanmalik', url: 'https://www.linkedin.com/' },
    { id: 'x', label: 'X', handle: '@rayanmalik', url: 'https://x.com/' },
    { id: 'dribbble', label: 'Dribbble', handle: '@rayanmalik', url: 'https://dribbble.com/' },
    { id: 'readcv', label: 'Read.cv', handle: '/rayan', url: 'https://read.cv/' },
    { id: 'mail', label: 'Email', handle: 'hello@example.com', url: 'mailto:hello@example.com' },
  ],
} as const;

/* ------------------------------------------------------------------ */

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export const experience: ExperienceItem[] = [
  {
    company: 'Studio Meridian',
    role: 'Founder & Principal Engineer',
    period: '2023 — Present',
    location: 'Lahore, PK · Remote',
    summary:
      'Independent practice building editor tools, design systems and front-end architecture for teams between five and two hundred engineers.',
    highlights: [
      'Shipped Cadence, a 210-component design system adopted by four product teams in one quarter.',
      'Cut first contentful paint on a marketing platform from 3.4s to 1.1s by rebuilding the render path and asset graph.',
      'Ran twelve accessibility audits; closed every P1 finding and wrote the internal review checklist that replaced them.',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Rust', 'PostgreSQL'],
  },
  {
    company: 'Northwind Systems',
    role: 'Senior Front-End Engineer',
    period: '2021 — 2023',
    location: 'Karachi, PK · Hybrid',
    summary:
      'Led the interface layer of a B2B logistics platform handling roughly 90,000 shipments a day.',
    highlights: [
      'Rewrote the shipment table virtualiser, dropping scroll jank to an unmeasurable frame budget at 50k rows.',
      'Introduced typed API contracts that removed a recurring class of production null-reference defects.',
      'Mentored six engineers; three moved into senior roles within a year.',
    ],
    stack: ['React', 'TypeScript', 'GraphQL', 'WebSockets'],
  },
  {
    company: 'Kolachi Interactive',
    role: 'Product Designer → Front-End Engineer',
    period: '2018 — 2021',
    location: 'Lahore, PK',
    summary:
      'The crossover job. Designed the product for two years, then asked to build it and never went back to only designing.',
    highlights: [
      'Built the onboarding flow that lifted week-one activation from 38% to 61%.',
      'Designed and maintained the first shared component library, later the basis of Cadence.',
      'Ran the user research programme: 40 interviews, one findings repository nobody stopped using.',
    ],
    stack: ['Figma', 'React', 'Node.js', 'Sass'],
  },
  {
    company: 'Freelance',
    role: 'Web Developer',
    period: '2016 — 2018',
    location: 'Lahore, PK',
    summary: 'Themes, small business sites and a lot of late-night debugging on shared hosting.',
    highlights: [
      'Delivered 30+ client sites across retail, education and hospitality.',
      'Learned to write CSS that survives a client with a colour picker.',
    ],
    stack: ['PHP', 'WordPress', 'jQuery', 'Sass'],
  },
];

/* ------------------------------------------------------------------ */

export const skillGroups = [
  {
    group: 'Interface',
    items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Radix Primitives', 'Figma', 'Design tokens'],
  },
  {
    group: 'Platform',
    items: ['Vite', 'Node.js', 'PostgreSQL', 'GraphQL', 'WebSockets', 'Edge functions', 'Playwright'],
  },
  {
    group: 'Craft',
    items: ['Design systems', 'Accessibility (WCAG 2.2 AA)', 'Performance budgets', 'Editor tooling', 'Rust basics', 'Technical writing'],
  },
];

export const education = [
  {
    school: 'University of Engineering and Technology, Lahore',
    credential: 'BSc Computer Science',
    period: '2014 — 2018',
    note: 'Final year project: a constraint-based layout solver for print-style web grids.',
  },
];

export const certifications = [
  { name: 'W3C Web Accessibility Specialist', year: '2022' },
  { name: 'Google Mobile Web Performance', year: '2021' },
];

/* ------------------------------------------------------------------ */

export const faq = [
  {
    q: 'Who is Rayan Malik?',
    a: 'Rayan Malik is a product engineer and interface designer based in Lahore, Pakistan, working across editor tooling, design systems and front-end architecture. He runs Studio Meridian and has shipped interfaces used by teams of forty or more engineers.',
  },
  {
    q: 'What is RayanOS?',
    a: 'RayanOS is this portfolio — an interactive desktop environment built with React 19, TypeScript, Vite and Zustand. It presents biography, case studies, gallery and contact information as draggable application windows, a taskbar and a start menu.',
  },
  {
    q: 'What does Rayan Malik work on?',
    a: 'Design systems, editor and tooling interfaces, data-dense dashboards, performance and accessibility work. Recent projects include Cadence, a 210-component design system, and Trellis, a branch-aware preview engine for static sites.',
  },
  {
    q: 'Is Rayan Malik available for work?',
    a: 'Yes. He takes on product engineering roles and short interface contracts of roughly two to three weeks. The fastest route is the contact app in this desktop, or email at hello@example.com.',
  },
  {
    q: 'How was this portfolio built?',
    a: 'React 19 with TypeScript on Vite, Zustand for the window manager and lock screen state, Tailwind for utilities and hand-written CSS for the acrylic surfaces, plus Framer Motion for the boot and window animations. It is open source as a template.',
  },
];

/* ------------------------------------------------------------------ */

export const testimonials = [
  {
    quote:
      'Rayan rebuilt our component layer in a quarter and then wrote the docs that meant we did not need him for the next one. Rare combination.',
    name: 'Sana Iqbal',
    title: 'Head of Product, Northwind Systems',
  },
  {
    quote:
      'He found the three interactions that were actually costing us money and fixed them. Nobody else had even looked at the numbers.',
    name: 'Tobias Lund',
    title: 'Engineering Manager, Meridian client',
  },
  {
    quote:
      'The most useful review comment I have ever received was four words long and saved us a rewrite.',
    name: 'Amna Rafiq',
    title: 'Design Lead, Kolachi Interactive',
  },
];

export const timeline = [
  { year: '1996', text: 'Born in Lahore, Pakistan.' },
  { year: '2016', text: 'First paid website for a bookshop on Mall Road.' },
  { year: '2018', text: 'Graduated in computer science; joined Kolachi Interactive as a product designer.' },
  { year: '2020', text: 'Moved from design into engineering full-time.' },
  { year: '2021', text: 'Joined Northwind Systems as a senior front-end engineer.' },
  { year: '2023', text: 'Started Studio Meridian and shipped Cadence.' },
  { year: '2025', text: 'Released Trellis and began writing publicly about interface decisions.' },
  { year: '2026', text: 'Rebuilt this portfolio as an interactive desktop environment.' },
];
