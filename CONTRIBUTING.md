# Contributing to RayanOS

Thanks for looking. This project exists to be forked, re-skinned and made worse before it is made
better — so contributions of every size are welcome.

## Ways to help

- **Report a bug** — open an issue with your browser, operating system and what you expected
- **Suggest a feature** — the roadmap at the bottom of the README is not a contract
- **Improve accessibility** — the most valuable contributions here; the shell is complex and always
  one interaction away from trapping a keyboard user
- **Add an application** — a good app is under 400 lines and does one thing properly
- **Fix the copy** — typos, unclear sentences and awkward phrasing are real bugs

## Local setup

```bash
git clone https://Muhammad112233-creator.github.io/Portfolio-Template-17/
cd rayan-os-portfolio
npm install
npm run dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173).

## Before you open a pull request

```bash
npm run build    # must pass — this type-checks as well as bundles
npm run lint     # type-check only, faster feedback while iterating
```

Both must be clean. A pull request that does not compile will not be reviewed.

## Code conventions

**Components** — one file per application under `src/components/apps/`, one file per shell surface
under `src/components/os/`. Keep them readable: a reviewer should understand the file in one pass.

**Styling** — use the existing CSS custom properties rather than hard-coded colours, so the whole
shell keeps responding to theme and accent changes:

```tsx
// good — follows the theme
style={{ background: 'var(--os-accent)', color: 'var(--os-text)' }}

// avoid — breaks in light mode and ignores the accent picker
style={{ background: '#5c83ff', color: '#111' }}
```

**Motion** — springs for anything the user drives (windows, flyouts), short eases for what the system
does on its own (toasts, page transitions). Respect `prefers-reduced-motion`; the global rule in
`src/index.css` already handles this, so do not add animations that would be harmful without motion.

**State** — all shell state lives in the Zustand store at `src/store/os.ts`. Do not introduce a second
store or a context provider for shell state; extend the store instead.

**Content** — never hard-code a name, a project or a URL inside a component. Everything user-facing
belongs in `src/data/`.

**Accessibility** — every interactive element needs an accessible name. Windows must keep their
`role="dialog"` and label. Switches keep `role="switch"` and `aria-checked`. Test with the keyboard
only before you call it done.

**Copy** — write like a person. No exclamation marks in interface text, no "seamless", no
"revolutionary", no filler. If a sentence could appear on any other portfolio, rewrite it.

## Adding an application

1. Create `src/components/apps/MyApp.tsx`
2. Register the id in `src/components/apps/AppView.tsx`
3. Add the app type to `AppId` in `src/store/os.ts`
4. Add the entry to `src/data/apps.ts`
5. If it needs an icon, map a lucide glyph in `src/lib/icons.tsx`

Search, the start menu, the task view, the store and the desktop context menu all read from that
registry, so your app appears everywhere for free.

## Commit messages

Plain and descriptive. Present tense, no full stop.

```
Add window snapping to screen edges
Fix task view losing focus on Escape
Correct the storage chart label in Settings
```

## License

By contributing you agree that your work is released under the [MIT License](./LICENSE).
