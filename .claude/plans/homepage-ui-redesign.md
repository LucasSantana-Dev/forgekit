# Homepage UI/UX Redesign

## Objective

Fix the Forge Kit homepage's crowded layout, poor contrast, and legibility issues while strengthening its commitment to the dark theme and brand identity. The redesign applies impeccable design laws to create a more scannable, contrast-rich experience that earns developer trust through visual clarity and density without clutter.

---

## Current Issues Diagnosed

### 1. **Contrast Violations**
- **Base.astro:124–129** — Color tokens are inadequate:
  - `--fg-muted: oklch(68% 0.005 75)` on `--bg: oklch(6% 0.006 75)` = 62% lightness delta, **AA compliant but barely legible at body size** (should be 70%+ delta for comfortable reading).
  - `--fg-subtle: oklch(52% 0.005 75)` on void/forge-black backgrounds = **fails WCAG AA** for body text (only 49% delta); should be used for decorative/metadata only, not prose.
  - Secondary text descriptions (`.card p`, `.hero p.lede`) use `--fg-muted` which is too dim for comfortable reading at small sizes.

### 2. **Crowded Hero Section**
- **Base.astro:388–395** — Hero grid uses `grid-template-columns: minmax(0, 1.35fr) minmax(290px, 0.9fr)` with `gap: clamp(1.25rem, 3vw, 2rem)`.
  - The aside column is packed: `.hero-install` + `.kind-legend` (6 items in 2 columns) = too much cognitive load.
  - No breathing room; elements compete for attention. The kind legend doubles visual weight without earning its space.

### 3. **Cluttered Card Grid**
- **Base.astro:680–684** — `.grid { grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); }` produces dense, uniform grids.
  - No rhythm in spacing: all gaps are `0.95rem`. Identical cards in identical grid = monotony.
  - Cards are the lazy answer; nested cards (`.hero-surface` wrapping `.grid` in CollectionsFeaturedGrid) violate the "never nest cards" rule.

### 4. **Poor Section Hierarchy**
- **index.astro:114–120** — `.section-top` layout uses `justify-content: space-between`, pushing the "View All" link to far right.
  - No visual weight difference between section intro and content below; sections blend together.
  - Typography hierarchy weak: h2 at `clamp(1.1rem, 2vw, 1.45rem)` is same size across all sections — no emphasis on featured vs. secondary.

### 5. **Overcomplicated Kind Legend**
- **index.astro:77–108** — Kind legend consumes 6 items in 2-column grid; takes precious real estate in hero.
  - Duplicates information visible in card headers.
  - No filtering behavior — just visual; passengers on the layout.

### 6. **Hero Surface Nesting Issue**
- **CollectionsFeaturedGrid.astro:19–25** — `.hero-surface` wraps both heading and a grid of cards.
  - Violates "don't nest cards" rule: `.hero-surface` is a card-like container holding other cards.
  - Creates visual weight imbalance: too many rectangular layers.

### 7. **Missing Line-Length Cap**
- **Base.astro:424–429** — `.hero p.lede` has `max-width: 72ch` ✓ good.
  - But `.lead-muted` (`.section-top h2 + p`) uses `max-width: 62ch` ✓ good.
  - However, many body paragraphs lack caps. `.markdown p`, `.card p` have no `max-width` enforcement; prose can sprawl.

### 8. **Hue Drift in Root Colors**
- **Base.astro:119–134** — Root colors use `hue: 75` (yellowish) instead of the design system's canonical `hue: 265` (indigo).
  - `--bg: oklch(6% 0.006 75)` vs. design spec `oklch(6% 0.003 265)`.
  - Creates a warm dark theme instead of the cool indigo lean the design system prescribes.
  - Mismatch with kind system (which uses correct hues: 75, 275, 185, etc.).

### 9. **Overuse of Tinted Borders (opacity-based)**
- **Base.astro:370, 478, 600, etc.** — Borders use `rgba(255,255,255,0.08)` throughout.
  - Thin white-transparent borders lose visibility at small sizes and don't carry signal.
  - Should use OKLCH-based borders with actual hue information, not opacity fades.

---

## Color Strategy

**Chosen Strategy: Restrained + Committed Dark**

The homepage theme is **dark is justified** — the scene ("developer browsing an AI toolkit catalog at their desk") doesn't force dark, but Forge Kit's brand personality ("opinionated craftsman, earned confidence") makes dark a design **commitment**, not a reflex. We own it by fixing the contrast and removing warm hue drift.

### Specific OKLCH Values

**Core Backgrounds** (fix hue to 265, increase contrast):
- `--bg: oklch(5% 0.003 265)` — void (from 6%→5%, hue 75→265)
- `--bg-elev: oklch(9% 0.003 265)` — elevated surface (from 9%, hue 75→265)
- `--bg-panel: oklch(12% 0.003 265)` — panel/hover surface (from 11%, hue 75→265)
- `--bg-hover: oklch(15% 0.003 265)` — interactive hover (from 14%, hue 75→265)

**Foreground Text** (increase lightness/chroma for readability):
- `--fg: oklch(96% 0.003 265)` — primary text (good, near-white)
- `--fg-muted: oklch(72% 0.005 265)` — secondary text (from 68%→72%; 67% delta vs. 5% bg)
- `--fg-subtle: oklch(58% 0.004 265)` — tertiary/decorative (from 52%→58%; still supports AA for small caps)

**Accent & Utilities**:
- `--accent: oklch(85% 0.004 265)` — interactive accent (from 82%, reduce chroma to match brand restraint)
- `--accent-hot: oklch(99% 0.002 265)` — hover/active state (reduce chroma to prevent neon effect)
- `--border: oklch(100% 0 0 / 0.12)` — keep opacity-based but increase alpha (from 0.08→0.12 for visibility)
- `--border-strong: oklch(100% 0 0 / 0.2)` — stronger border (from 0.14→0.2)
- `--code-bg: oklch(100% 0 0 / 0.06)` — code block (from 0.035→0.06, lighter for readability)
- `--chip-bg: oklch(100% 0 0 / 0.08)` — chip/tag surface (from 0.05→0.08)

**Kind System** (already correct in design; ensure CSS uses correct values):
- `--kind-skill: oklch(75% 0.08 75)` ✓
- `--kind-agent: oklch(72% 0.10 275)` ✓
- `--kind-server: oklch(73% 0.09 185)` ✓
- `--kind-collection: oklch(71% 0.10 15)` ✓
- `--kind-doc: oklch(70% 0.09 235)` ✓
- `--kind-hook: oklch(73% 0.11 45)` ✓
- `--kind-command: oklch(85% 0.015 85)` ✓
- `--kind-tool: oklch(72% 0.09 145)` ✓

---

## Phase 1: Contrast & Color Foundation

### Changes

1. **Update Base.astro:119–133 CSS custom properties**:
   - Replace all `hue: 75` backgrounds with `hue: 265` (indigo lean).
   - Increase `--fg-muted` from `68%` to `72%` lightness.
   - Increase `--fg-subtle` from `52%` to `58%` lightness.
   - Increase `--border` opacity from `0.08` to `0.12`.
   - Increase `--code-bg` opacity from `0.035` to `0.06`.
   - Increase `--chip-bg` opacity from `0.05` to `0.08`.

2. **Verify contrast ratios**:
   - `--fg (96%) on --bg (5%)` = 91% delta ✓✓ (exceeds WCAG AAA)
   - `--fg-muted (72%) on --bg (5%)` = 67% delta ✓ (meets WCAG AA)
   - `--fg-subtle (58%) on --bg (5%)` = 53% delta ✓ (meets WCAG AA for small caps/metadata)

3. **Update all background gradients in Base.astro**:
   - **Line 194** (`body` gradient): Replace `#040404`/`#070707` with equivalent OKLCH: `oklch(3% 0.003 265)` to `oklch(5% 0.003 265)`.
   - **Line 374** (`.hero-shell` gradient): Update `rgba(18, 18, 20, 0.96)` to `oklch(5% 0.003 265 / 0.96)`.

### Acceptance Criteria
- [ ] All backgrounds use `hue: 265` (indigo lean).
- [ ] Text contrast: primary `--fg` on any background ≥80% delta; secondary `--fg-muted` ≥65% delta.
- [ ] Borders visible at 12px+ size without squinting; code blocks have visible background distinct from base.
- [ ] No `#000000` or `#ffffff` in CSS; all colors are OKLCH with tints.
- [ ] Browser inspection confirms WCAG AA on all text/background pairs.

---

## Phase 2: Layout & Spacing — Declutter Homepage

### Changes

1. **Simplify Hero Section (index.astro + Base.astro:388–555)**:
   - Remove `.kind-legend` from hero aside entirely (lines 77–108 in index.astro).
   - Replace with single-column hero: left copy, right: `.hero-install` only.
   - Update `Base.astro:391` grid to: `grid-template-columns: 1fr 320px;` (simpler ratio).
   - Increase gap to `clamp(2rem, 4vw, 3rem)` for breathing room.
   - Kind legend becomes a **collapsible or tooltip component** (future), not inline real estate.

2. **Restore `.hero-install` Prominence** (Base.astro:505–516):
   - Increase `.hero-install` padding from `1rem` to `1.5rem`.
   - Strengthen border color from `oklch(75% 0.08 75 / 0.14)` to `oklch(75% 0.08 75 / 0.22)` (skill color, more visible).
   - Update background to `oklch(75% 0.08 75 / 0.06)` (from `0.03`, higher contrast with border).
   - Add soft shadow: `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);` on hover.

3. **Remove Nested Card Structure in Collections Section** (CollectionsFeaturedGrid.astro:19–25):
   - Delete the `.hero-surface` wrapper around featured collections.
   - Replace with a flat structure: heading/lede above grid, no extra surface.
   - Grid itself becomes the only card container.
   - Update `.grid` on line 26 to use larger min-width: `minmax(260px, 1fr)` (from 240px; gives cards breathing room).

4. **Vary Section Spacing** (Base.astro:557–583 + index.astro structure):
   - `.section-top` margin: change `margin: 2.2rem 0 1rem;` to **`margin: 3rem 0 1.5rem;`** (more breathing room between sections).
   - Add variant spacing for "featured" vs. "overflow" sections:
     - Featured collections: `margin-bottom: 2rem;`
     - Tag chips: `margin: 1.5rem 0;`
   - No uniform padding everywhere — rhythm through **varied whitespace**.

5. **Improve Section Hierarchy** (Base.astro:556–564):
   - Add a subtle visual separator above major sections (border-top is not a stripe, just a divider line).
   - h2 size: increase to `clamp(1.3rem, 2.2vw, 1.65rem)` from `clamp(1.1rem, 2vw, 1.45rem)`.
   - Section intro (p after h2): enforce `max-width: 65ch`.

6. **Cap Body Text Line Length** (Base.astro:732–740):
   - `.card p`: add `max-width: 68ch;` (currently unbounded, can sprawl).
   - `.markdown p`: add `max-width: 70ch;`.
   - `.entry-desc`: already capped at `68ch` ✓.

### Acceptance Criteria
- [ ] Hero aside is clean: install block only, no kind legend clutter.
- [ ] Featured collections grid is flat (no nested `.hero-surface`).
- [ ] Section spacing varies: major sections have ≥2.5rem margin above, minor ≤1.5rem.
- [ ] All prose capped at 65–70ch max-width.
- [ ] No visual rhythm repetition: spacing/padding differ across page sections.
- [ ] Inspect layout: no more than 3 competing visual weight levels per viewport.

---

## Phase 3: Typography Hierarchy

### Changes

1. **Enforce Heading Scale Ratio ≥1.25×** (Base.astro:348–360):
   - Currently: h1 `clamp(1.8rem, 3vw, 2.6rem)`, h2 `clamp(1.1rem, 2vw, 1.45rem)`.
   - At max: 2.6rem / 1.45rem = 1.79× ✓ good ratio.
   - At min: 1.8rem / 1.1rem = 1.64× ✓ still good.
   - **Action: Keep as-is; confirm ratio >= 1.25× across all breakpoints.**

2. **Increase h2 Prominence** (Base.astro:355–359):
   - h2 font-weight: increase from `700` to `720` (matches h1's decisiveness).
   - h2 color: ensure `var(--fg)` (already is) — primary text, not muted.
   - h2 letter-spacing: keep `-0.04em` for consistency with h1.

3. **Fix Hero h1 Scale** (Base.astro:418–423):
   - Hero h1 is `clamp(2.9rem, 6vw, 5.4rem)` — correct.
   - Ensure line-height `0.92` is intentional (tight for impact). Keep it.

4. **Body Text: Enforce Consistency** (Base.astro:732–741):
   - `.card p` line-height: already `1.56` ✓.
   - `.hero p.lede` line-height: already `1.7` ✓ (more spacious for hero prose).
   - Ensure all body text uses `--fg-muted` (72% OKLCH, not `--fg`).

5. **Secondary Text Hierarchy** (Base.astro:786–805):
   - `.kind` label: confirm size `0.78rem` (currently is).
   - `.tag` size: `0.7rem` ✓.
   - `.kind-legend-count` size: `0.75rem` ✓.
   - No changes needed; hierarchy is intact.

### Acceptance Criteria
- [ ] All heading scales maintain ≥1.25× ratio.
- [ ] Body text line-height ≥1.5 (1.56–1.7 confirmed).
- [ ] No heading uses `--fg-muted` color; h1–h3 use `var(--fg)` only.
- [ ] Line-length caps enforced: body ≤70ch, card descriptions ≤68ch.
- [ ] All text at 15px+ base size is readable at arm's length (no squinting required).

---

## Phase 4: Card & Component Polish

### Changes

1. **Update Card Styling** (Base.astro:685–759):
   - **Background**: change from `rgba(255,255,255,0.02)` to `rgba(255,255,255,0.03)` (slightly more visible).
   - **Border**: change from `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.12)` (align with new `--border` value).
   - **Hover state**: change background from `rgba(255,255,255,0.03)` to `rgba(255,255,255,0.05)`.
   - **Hover border**: change from `0.14` to `0.2` (align with `--border-strong`).
   - **Shadow**: keep `0 22px 48px rgba(0, 0, 0, 0.3)` on hover (already appropriate).
   - **Icon background**: change from `color-mix(in oklch, var(--card-accent) 12%, transparent)` to **`color-mix(in oklch, var(--card-accent) 14%, transparent)`** (slightly brighter tint).
   - **Icon border**: change from `20%` to `22%` (more contrast with background).

2. **Remove Nested Cards (Collections Feature)** (CollectionsFeaturedGrid.astro:19–39):
   - Delete `.hero-surface` wrapper (line 19).
   - Restructure:
     ```astro
     ---
     <!-- Remove <section class="hero-surface"> -->
     <div class="section-collections-header">
       {heading && <div class="section-title">{heading}</div>}
       {lede && <p class="section-lede">{lede}</p>}
     </div>
     <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
       <!-- cards -->
     </div>
     ```
   - Add new CSS in Base.astro for `.section-collections-header`:
     ```css
     .section-collections-header {
       margin-bottom: 1.2rem;
     }
     .section-title {
       display: inline-flex;
       align-items: center;
       gap: 0.35rem;
       margin-bottom: 0.65rem;
       color: var(--fg-subtle);
       font-size: 0.72rem;
       letter-spacing: 0.16em;
       text-transform: uppercase;
       font-weight: 700;
     }
     .section-title::before {
       content: "";
       width: 8px;
       height: 8px;
       border-radius: 50%;
       background: var(--kind-collection);
       box-shadow: 0 0 0 4px oklch(71% 0.10 15 / 0.14);
     }
     .section-lede {
       max-width: 65ch;
       color: var(--fg-muted);
       margin: 0 0 0.8rem;
     }
     ```

3. **Strengthen Kind Label Visibility** (Base.astro:786–805):
   - `.kind` padding: change from `0` to `0.25rem 0.5rem` (small breathing room).
   - `.kind` font-size: increase from `0.78rem` to `0.8rem` (slightly larger, more visible).
   - `.kind` font-weight: already `600` ✓.
   - Ensure all kind-specific classes (`.kind-skill`, `.kind-server`, etc.) use correct OKLCH hues (already correct).

4. **Improve Tag/Chip Styling** (Base.astro:651–678):
   - `.chip` background: change from `rgba(255,255,255,0.04)` to `rgba(255,255,255,0.06)` (more visible at rest).
   - `.chip:hover` background: change from `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.1)` (stronger contrast on hover).
   - `.chip.active` background: change from `rgba(255,255,255,0.1)` to `rgba(255,255,255,0.12)`.
   - `.chip` border: change from `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.12)`.
   - `.chip:hover` border: change from `0.18` to `0.22`.
   - `.chip.active` border: keep `0.22` ✓.

5. **Fix Install Block** (Base.astro:822–870):
   - Background: change from `rgba(255,255,255,0.02)` to `rgba(255,255,255,0.03)`.
   - Border: change from `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.12)`.
   - `.cmd` color: ensure it uses `var(--fg)` (primary text, not muted).
   - Copy button: change from `rgba(255,255,255,0.04)` to `rgba(255,255,255,0.06)`.
   - Copy button border: change from `0.1` to `0.14`.
   - Copy button hover: change from `0.07` to `0.1`.

### Acceptance Criteria
- [ ] Cards have visible background + border distinction at rest (no invisible surfaces).
- [ ] Hover states show clear elevation + color shift (≥0.02 RGBA difference).
- [ ] Kind labels are legible at 12px viewport (test on mobile).
- [ ] No nested card structures (CollectionsFeaturedGrid is flat).
- [ ] Tags/chips have distinct active state (≥0.04 RGBA difference from rest).
- [ ] Copy-to-clipboard affordances are clear and tap-friendly (≥44px height on mobile).

---

## Implementation Boundaries

**DO NOT touch**:
- `.prefers-reduced-motion` media queries (already correct, maintain them).
- Scroll reveal animations (`.sr`, IntersectionObserver logic in Base.astro:1094–1124).
- Mobile breakpoints (640px, 900px); only adjust if spacing changes demand it.
- Navigation bar (sticky header, blur, nav links) — these are working well.
- Footer styling.
- Font loading (`Geist`, font-feature-settings: cv11, ss01, ss03).
- Skip-link accessibility feature.
- `focus-visible` outline behavior.

**DO revise**:
- All CSS custom properties (root colors in Base.astro:118–147).
- Hero section grid layout (index.astro + Base.astro hero styles).
- CollectionsFeaturedGrid component (remove nesting).
- Card + tag + chip styling (spacing, borders, backgrounds).
- Section top spacing and typography hierarchy.

---

## Known Constraints

1. **Astro 6** — No significant build/rendering constraints; CSS and component structure are straightforward.
2. **Cloudflare Pages** — Static build output; no server-side rendering. All changes are CSS + component structure.
3. **pnpm monorepo** — Build command: `pnpm web:build` from repo root. No changes to package.json needed.
4. **Bilingual support** — Portuguese (pt-BR) is already in place. No copy changes required for contrast/layout fixes.
5. **Dark-mode only** — No light theme to update. The dark theme adjustments apply universally.

---

## Validation

**Builder must run**:
```bash
cd /Volumes/External HD/Desenvolvimento/ai-dev-toolkit
pnpm web:build
```

**Browser inspection checklist**:
1. Open `http://localhost:3000` (or deployed URL).
2. **Contrast**: Use DevTools accessibility inspector on all text. All foreground/background pairs must meet WCAG AA (4.5:1 for body, 3:1 for large text).
3. **Layout**: Hero aside should show only `.hero-install` (no kind legend). Featured collections should be flat (no nested surfaces).
4. **Spacing**: Sections should have distinct margins (not uniform). Cards should feel breathable, not cramped.
5. **Cards**: On hover, cards should elevate slightly and show stronger border + shadow. Icon tint should be visible.
6. **Mobile** (375px viewport): 
   - Hero should stack vertically (grid-template-columns: 1fr).
   - Cards should be full-width or single-column.
   - Tags should wrap without overflow.
   - No text should exceed viewport width.

**Automated checks**:
- `pnpm web:check` (if linting is configured) — should pass.
- Browser DevTools accessibility audit — Lighthouse score ≥90 for Accessibility.

---

## Replan Triggers

If any of the following occurs during implementation, replan:

1. **Accessibility audit fails** on any text pair: lightness delta < 45% for body text.
2. **Mobile layout breaks** at 375px: cards overflow, text unreadable, layout shifts dramatically.
3. **Hero grid proportion feels wrong** after removing kind legend: consider 1.5fr / 1fr instead of 1fr / 320px.
4. **Collections section looks too empty** after flattening: add subtle visual separator (horizontal rule) above "Popular Tags" section.
5. **Kind colors become hard to distinguish** due to background lightness changes: verify each kind color on new bg (5% OKLCH).

---

## Summary

This redesign fixes the three core issues:

1. **Contrast**: New OKLCH values ensure body text (72% on 5%) is comfortable at 15px+; metadata (58%) is AA-compliant for small caps.
2. **Crowding**: Removing kind legend from hero, flattening collections, and varying section spacing creates rhythm without whitespace waste.
3. **Dark Theme Commitment**: Hue shift from 75 to 265 (indigo lean) aligns with design system intent; rest of palette remains disciplined, restrained, and readable.

The implementation is low-risk: CSS changes in Base.astro + component restructure in CollectionsFeaturedGrid. No behavioral changes, no build system modifications, no i18n work. Estimated effort: 2–3 hours for thorough builder execution with proper QA.
