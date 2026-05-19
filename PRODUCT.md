# Autodidact — Design System

## Design Context

### Users
Developers who are self-directed learners juggling multiple knowledge sources — books, courses, videos, podcasts. They're drowning in information from many directions and need a system to distill, connect, and retain what they learn. They use this at their desk, often alongside a code editor, during focused learning sessions or when reviewing what they've absorbed. The core job: turn chaotic, scattered inputs into structured, connected understanding.

### Brand Personality
**Calm, focused, deliberate.**

Autodidact takes the overwhelming chaos of learning from dozens of sources and makes it feel manageable. The interface should communicate: "You are in control. Your knowledge is organized. Every piece connects." It should inspire confidence to tackle new topics because the system will help you tie new knowledge back to what you already know.

This is NOT playful, whimsical, or casual. It's a serious tool for serious learners — but never cold or intimidating. Think mission control: complex operations made legible through disciplined design.

### Aesthetic Direction
**Neo-industrial / Mission control**

Visual references: 2001: A Space Odyssey control rooms, HAL 9000 interfaces, Soviet-era instrument panels, the R1 Autonomous Defense poster series (grid systems, registration marks, crosshair elements, bold condensed type on structured grids), Dieter Rams industrial design, technical spec sheets, field manuals.

**Color palette:**
- Dark neutrals are cool-tinted (slight blue/slate): base black #131316, dark surface #1a1a1e, mid dark #2a2a30, mid #64646c, light mid #a0a0a8, text on dark #e8e8ec
- Light mode retains warm cream tones: cream #f0ebe4, light cream #f7f3ed
- Red is the sole accent color (#c8352e) — used sparingly for emphasis, status, and key interactive elements. Red dark (#8b2520) for pressed states.
- No other accent colors. The palette is deliberately constrained: cool blacks, warm creams, red.
- Supports both light and dark modes

**Anti-references (what this must NOT look like):**
- Playful, rounded, friendly SaaS (Notion, Linear)
- Neon-on-dark developer tool aesthetic
- Whimsical illustrations or bouncy animations
- Generic dashboard with card grids and gradient accents
- Anything that reads as "consumer app"

**Theme:** Both light and dark mode. Dark mode is primary (matches the control room aesthetic and developer context). Light mode as alternate, using cream/warm white surfaces with carbon black text.

### Typography Direction
Three-font system pairing a bold grotesque display with a warm humanist body and a raw mono for data.

- **Display/headings:** PP Neue York Normal Extrabold (800 weight) — wide, bold, poster-grade presence for page titles, section headers, large callouts. All-caps for display text. From Pangram Pangram, inspired by NYC signage.
- **Body/UI:** Karla (400–700 weight) — a grotesque with personality. Slightly quirky letterforms that feel warm without going corporate. Used for body text, navigation, labels, breadcrumbs, filter tabs, status indicators, buttons, and all UI chrome. Uppercase with letter-spacing (0.1em) for small labels.
- **Data values:** Departure Mono (400 weight) — raw mono for data readouts: source types (BOOK, COURSE), chapter/lecture counts (Ch. 7/12), percentages, database IDs, code snippets, table cell values. Never used for navigation, labels, or UI chrome.
- Registration marks (crosshairs, corner brackets) as subtle decorative elements in key layouts.

### Motion
- Animations feel mechanical and precise — like instrument panel indicators, not bouncing balls
- Ease-out with smooth deceleration, no bounce or elastic easing
- Staggered reveals for lists/grids (like systems coming online)
- Subtle state transitions on interactive elements
- Respect prefers-reduced-motion

### Design Principles
1. **Order from chaos** — Every layout decision should make complex information feel structured and navigable. Dense is fine; cluttered is not.
2. **Deliberate restraint** — The constrained palette (black, cream, red) forces every color choice to be meaningful. Red means something. Don't dilute it.
3. **Systematic precision** — Grid-based layouts, consistent spacing scales, repeating structural patterns. The interface should feel engineered, not decorated.
4. **Quiet confidence** — The design doesn't shout. It communicates competence through craft: tight typography, precise alignment, considered negative space.
5. **Industrial warmth** — Neo-industrial, not brutalist-cold. The warm cream tones, the red accent, and the slightly warm-tinted neutrals keep it human despite the technical aesthetic.

### Accessibility
- ARIA roles and semantic HTML for all interactive elements (testable by Playwright)
- Sufficient contrast ratios for text readability
- Keyboard navigation support
- prefers-reduced-motion respected
- Not targeting WCAG AAA; functional accessibility that supports automated testing
