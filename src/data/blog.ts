export interface Post {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  body: string[];
}

export const posts: Post[] = [
  {
    slug: 'the-default-is-the-product',
    title: 'The default is the product',
    date: '2026-08-14',
    readTime: '6 min',
    tags: ['Interface', 'Opinion'],
    excerpt:
      'Most people never change a setting. That makes every default decision consequential, and most teams treat them as an afterthought.',
    body: [
      'There is a version of product work where defaults are decided in the last fifteen minutes of a planning meeting. Someone says "let us ship it on by default and see", someone else nods, and twelve thousand people get a behaviour nobody chose.',
      'Defaults are the product for the majority of users. The settings screen is a minority sport. If your default is wrong, the feature is not badly configured — it is badly designed, and no amount of toggles will fix the first impression.',
      'The practical version of this: before shipping anything with a switch, write down who is better off under each state. If you cannot name the group that benefits from the non-default, the switch probably should not exist.',
    ],
  },
  {
    slug: 'measuring-what-jank-costs',
    title: 'Measuring what jank actually costs',
    date: '2026-06-02',
    readTime: '9 min',
    tags: ['Performance', 'Engineering'],
    excerpt:
      'Everyone agrees slow is bad. Almost nobody has a number. Here is how we put a price on dropped frames without a research team.',
    body: [
      'We had a data table that dropped frames on scroll. It was on the list for eleven months because nobody could argue it was worth a sprint. Then we stopped arguing and measured.',
      'We instrumented three things: the frame budget during scroll, the time between a row click and the detail panel being interactive, and the abandonment rate on the bulk-edit flow that lived inside that panel.',
      'The third number was the argument. Sessions that hit more than eight long frames during the bulk-edit flow abandoned at nearly twice the rate. Once the cost had a unit, the work was scheduled in a week.',
      'The lesson is not that jank is expensive. It is that engineering work competes for time against things with numbers attached, so attach one.',
    ],
  },
  {
    slug: 'keyboard-paths-are-not-power-features',
    title: 'Keyboard paths are not power-user features',
    date: '2026-03-19',
    readTime: '5 min',
    tags: ['Accessibility', 'Interface'],
    excerpt:
      'Treating keyboard support as an accessibility checkbox misses half the point. It is the same discipline that makes a tool feel fast.',
    body: [
      'The best compliment I have received about a tool I built was that someone stopped using the mouse. That did not happen because I added shortcuts at the end. It happened because the interaction model was built as a sequence of addressable actions from the start.',
      'When an interface is a list of named commands with a keyboard path, it also becomes testable, scriptable and describable. The shortcuts are a symptom of a clean model, not a feature bolted onto one.',
      'Practically: if you cannot express your main workflow as a short list of verbs, the problem is the model, and adding shortcuts will just give you a fast way to do the wrong thing.',
    ],
  },
  {
    slug: 'design-systems-fail-on-migration',
    title: 'Design systems fail on migration, not on components',
    date: '2025-11-08',
    readTime: '8 min',
    tags: ['Design systems', 'Process'],
    excerpt:
      'Building the library is the easy half. The half that decides whether it survives is getting eleven hundred existing screens to use it.',
    body: [
      'Every design system post-mortem I have read describes the same shape: a proud launch, healthy adoption for two quarters, then a slow slide back into bespoke components. The library was never the problem.',
      'What kills a system is the migration surface. If converting an existing screen to the new primitives is a half-day of careful work, engineers will do it only when they are already touching that file, which is rarely.',
      'What worked for us was treating migration as a product with its own roadmap: an automated codemod, a diff-based review process so review was quick, and a hard date after which the old folder was deleted. The deletion mattered most — it removed the option.',
    ],
  },
  {
    slug: 'writing-docs-nobody-reads-and-then-reading-them',
    title: 'Writing docs nobody reads, and then reading them',
    date: '2025-07-24',
    readTime: '4 min',
    tags: ['Writing', 'Process'],
    excerpt:
      'Documentation is a design artefact. If people cannot find the answer in thirty seconds, the document failed at layout, not at prose.',
    body: [
      'I used to write documentation as an act of conscience: thorough, chronological, complete. Then I watched a colleague scroll past four paragraphs to find one number, give up, and ask me in chat.',
      'The fix was structural, not editorial. Every page now opens with the answer in one line, then the reasoning, then the edge cases. Length did not change much; findability changed entirely.',
      'The test I use now: can someone get what they came for by reading only the first line of every heading? If not, the structure is wrong.',
    ],
  },
];
