# Autodidact — Design Intent Document

This document captures the interaction design intentions, animation behaviors, and technical decisions behind the Paper mockups. The mockups are static — this document describes what they'd do if they were alive.

---

## Global Patterns

### Sidebar Navigation
- Fixed 240px width, darker than main content (`#0e0e11` vs `#131316`)
- Active item gets a `#1a1a1e` background fill, white text, medium weight
- Inactive items are `#64646c`, no background
- The sidebar does not collapse on desktop — it's always present

### Page Headers
- Breadcrumb trail in Karla 12px uppercase `#64646c`
- Page title in PP Neue York Normal Extrabold, all-caps
- Primary action (red button) right-aligned on the same row as the title

### Data Values
- Departure Mono is used exclusively for machine-readable data: percentages, page numbers, chapter counts, API keys, source types (BOOK, COURSE), lecture/chapter progress (Ch. 7/12, Lec. 4/23)
- Never used for navigation, labels, tabs, breadcrumbs, or status text
- This creates a clear visual distinction between "human interface" text (Karla) and "data readout" text (Departure Mono)

### Alternating Row Backgrounds
- Odd rows: `#1a1a1e` (dark surface)
- Even rows: transparent (base shows through)
- This creates subtle zebra-striping without hard borders

### Status Indicators
- Red dot (`#c8352e`) + "PROCESSING" = active/in-progress
- Gray dot (`#a0a0a8`) + "COMPLETE" = finished
- Dim dot (`#2a2a30`) + "IDLE" = inactive
- These appear consistently across dashboard rows, source detail headers, and chapter lists

### Progress Bars
- Track: `#2a2a30`, 3-4px height, 1px border-radius
- Fill: `#c8352e` for active progress
- Fill: `#a0a0a8` for completed items (100%)

---

## Dashboard (Sources List)

### Interaction
- Clicking a source row navigates to the Source Detail page
- Hover state: row background lightens slightly to `#1e1e24`
- The filter tabs (ALL, BOOKS, COURSES, VIDEOS, PODCASTS) filter the list with an immediate re-render — no loading state needed for client-side filtering

### Animation
- On initial page load, source rows stagger in from bottom with 40ms delay between each — like systems coming online on a control panel
- `prefers-reduced-motion`: rows appear instantly, no stagger

---

## Source Detail (Chapter List)

### Interaction
- Clicking a chapter row navigates to the Chapter Analysis page
- The active chapter (red border, red chapter number) represents "currently processing" — this is a live status, not user selection
- Completed chapters have muted text and gray status dots

### Animation
- The progress bar at the top of the page animates on load from 0 to current percentage over ~600ms with ease-out-quart
- Chapter rows stagger in similar to dashboard rows

---

## Chapter Analysis (Concepts / Quotes / Questions)

### Tab Behavior
- Concepts, Quotes, Questions are client-side tab switches — no page navigation
- Active tab: white text, 2px red bottom border
- The content area crossfades between tabs (opacity transition, ~200ms)

### Concept Complexity Tags
- CORE: Red filled badge (`#c8352e` background, white text) — demands attention
- SUPPORTING: Bordered badge (`#1a1a1e` bg, `#2a2a30` border, `#a0a0a8` text) — present but secondary
- ADVANCED: Bordered badge with dimmer text (`#64646c`) — recedes further
- This three-tier visual hierarchy lets users scan a page of concepts and immediately identify the foundational ideas

### Two-Voice Body Text
- "Definition" text: brighter `#c8c8d0` — primary information
- "Why it matters" text: muted `#a0a0a8` — secondary/contextual
- Both use Karla 15px but the color difference creates a visual distinction without adding structural complexity

---

## Questions Tab (Retrieval Practice)

### Blur-to-Reveal Answers
- Default state: question text is fully visible. Answer area shows "HOVER TO REVEAL" label. Answer text is rendered but obscured by a `backdrop-filter: blur(6px)` overlay with semi-transparent background
- On hover: the blur overlay fades out over ~300ms (`transition: opacity 0.3s ease-out`), revealing the answer text
- The text is always in the DOM (not lazy-loaded) — the blur is purely visual
- `prefers-reduced-motion`: blur is removed entirely, replaced with a click-to-toggle visibility (display: none → block)

### Tier Headings
- "TIER 1" in bold + "BASIC RECALL" in lighter weight on the same line
- This gives structure without heavy section breaks — the tiers flow as a continuous study session

### Self-Grade Flow (Review Session)
- After revealing an answer, three buttons appear: Missed (red text), Struggled (gray text), Got it (white text)
- Clicking a grade advances to the next question with a slide-left transition
- The progress bar at top fills incrementally with each answered question
- The grade feeds into the spaced repetition algorithm — "Missed" schedules the question sooner, "Got it" pushes it further out

---

## Review Landing

### Stats Row
- Four metric tiles using Departure Mono at 28px for the numbers
- "Due today" number is red (`#c8352e`) when > 0 — the only stat that uses color to signal urgency
- The other stats (total questions, retention rate, day streak) use white — informational, not urgent

### Retention Health List
- "Due for review" section: sources with decaying retention. Red progress bars, red question counts. These are the urgent items.
- "Strong retention" section: sources the user has been reviewing well. Gray progress bars, "0 due" in muted text. These recede visually.
- The ordering within each section is by urgency — most decayed first

### Start Session
- The red "Start Session" button launches into the full-screen review session view
- Transition: the main content area crossfades while the sidebar slides out left, creating a focus-mode entrance

---

## Review Session (Full-Screen)

### Layout
- No sidebar — this is a distraction-free focus mode
- Content is centered on a 680px column
- Only elements: progress indicator, source/tier context, question, answer area, grade buttons

### Flow
1. Question appears with source attribution and tier label
2. User thinks, then hovers/clicks to reveal answer
3. Answer fades in below a divider
4. Three grade buttons appear
5. User grades → next question slides in from right
6. After final question: session summary screen with stats (X got it, Y struggled, Z missed)

### Ending the Session
- "End Session" link in top-right returns to Review Landing
- If ended early, progress is saved — answered questions are graded, remaining questions stay in the queue

---

## Knowledge Map (Force-Directed Constellation)

### Technical Architecture
- **Layout engine**: d3-force simulation with gravitational clustering per source
- **Rendering**: WebGL for the canvas (enables blur shader for depth-of-field effect), DOM overlay for labels and the detail panel
- **Performance target**: 60fps with 100-500 nodes on mid-range hardware

### Gravitational Clustering
- Each source (DDIA, MIT 6.824, etc.) has its own gravitational center — a force that pulls its concepts toward a shared region
- Concepts that share tags across sources get pulled by multiple gravitational wells — they settle in the space *between* their parent sources
- These "bridge concepts" (like "Consensus" between DDIA and MIT 6.824) are visually identifiable by their position between clusters

### Thermal Retention Coloring
- Node color maps to retention state from the review system:
  - Strong retention: dim gray (`#4a4a52`) — cool, stable
  - Moderate decay: warm gray (`#8b4a47`) — starting to fade
  - Due for review: red (`#c8352e`) — hot, needs attention
  - Critical: pulsing red with glow — overdue
- The entire graph becomes a heat map of knowledge health
- Color interpolation: linear from `#4a4a52` → `#8b4a47` → `#c8352e` based on days since last review vs scheduled interval

### "Systems Coming Online" Entrance
- On first load, the canvas is dark
- Source clusters materialize one at a time (300ms apart) with a fade-in + scale-up from 0.8 to 1.0
- After all clusters appear, cross-source edges sweep in with a trace animation (like current flowing through wires)
- Total entrance: ~2 seconds
- `prefers-reduced-motion`: instant static render, no animation

### Depth-of-Field Focus
- When a node is selected, a WebGL gaussian blur shader is applied to everything beyond 2 degrees of connection
- Focused nodes and their immediate neighbors remain sharp
- The blur transition takes ~400ms with ease-out
- This solves the density problem: 100 nodes are present but only 10-15 are in focus at any moment

### Interaction
- **Hover**: node highlights, label appears, 1st-degree connections highlight
- **Click**: detail panel slides in from right (340px wide), depth-of-field activates, connected edges turn red
- **Pan**: click-and-drag on canvas background
- **Zoom**: scroll wheel, with semantic zoom (zoomed out = cluster labels only, zoomed in = individual concept labels)
- **Search**: a search input (not shown in mockup) for jumping to specific concepts

### Detail Panel
- Shows: concept name, source/chapter attribution, definition text, retention status
- "Connected to" list with each connection's retention dot color and source attribution
- Actions: "Review Now" (starts a review session filtered to this concept's questions) and "View Analysis" (navigates to the chapter analysis page)

### Edge Rendering
- Internal cluster edges: very faint (`#1e1e24`, 1px) — visible structure but doesn't compete with content
- Cross-cluster edges: slightly brighter (`#1e1e24` to `#2a2a30`) — shows the bridge connections
- Active/selected edges: red (`#c8352e`, 1.5px, 0.5-0.7 opacity) — traces the path from selected node to its connections
- Edge bundling: when many edges share similar paths, they bundle into thicker traces to reduce visual noise

### Fallbacks
- `prefers-reduced-motion`: static layout, no entrance animation, no blur shader, click-to-focus instead of hover
- No WebGL: fall back to Canvas 2D rendering (lose the blur shader, replace with opacity-based dimming)
- Mobile: the graph is pan/pinch-zoomable, detail panel becomes a bottom sheet instead of side panel

---

## Add Source (Intake Dock)

### Mode Tabs
- FILE / URL / TEXT — switching modes changes the input area below
- FILE mode: drop zone or file browser trigger
- URL mode: text input that accepts paste
- TEXT mode: expandable multiline textarea
- Active mode has background fill, matching the filter tab pattern

### File Detection States
- After dropping/selecting a file, the input bar updates to show:
  - Status indicator: "PDF LOADED" / "TEXT LOADED" / etc. with red dot
  - Filename
  - Metadata in Departure Mono: page count, chapter count, file size, duration (for audio/video)
  - "Remove" action to clear and start over

### PDF Chapter Selection
- Appears below the file indicator when a PDF with an outline is loaded
- Multi-select checkboxes: red filled square = selected, border square = unselected
- Selected chapters: white text, medium weight. Unselected: muted gray text
- Chapter numbers and page numbers in Departure Mono
- "Select all" toggle in top-right of the section
- The submit button dynamically updates: "Process 3 Chapters" / "Process 1 Chapter" / "Process All"

### Audio/Video Scrubber (Future State)
- Waveform visualization rendered from audio analysis
- Draggable start/end markers with timestamp displays in Departure Mono
- "Full recording" toggle vs custom range selection
- This UI appears when an audio/video file is loaded instead of the chapter selection

### Tag Input with Live Connection Preview
- Typeahead input that searches existing tags as you type
- Suggestions show: tag name, usage count, most recent source using it
- New tags can be created inline (type + enter)
- Added tags appear as pills with `×` remove buttons

#### Density-Based Tag Coloring
- Tag pill background color interpolates based on how many sources share that tag:
  - 1 source (unique): cool gray (`#1e1e24`)
  - 2-3 sources: slight warm tint (`#2e2224`)
  - 4+ sources: warmer tint (`#3d2120`, approaching red)
- At a glance, you can see how connected this source will be — warm tags = well-connected

#### Live Connection Preview
- Appears below the tag input as soon as any tags are added
- Shows: "Will connect to N sources" with a red dot indicator
- Lists each source that shares at least one tag, with the specific connecting tags shown in muted text ("via distributed-systems, concurrency")
- Updates in real-time as tags are added/removed — debounced at 200ms
- If no connections exist: the preview doesn't appear (no "Will connect to 0 sources" empty state)

### Action Bar
- Model selector: provider icon + model name dropdown
- Submit button: "Process N Chapters" — count reflects current chapter selection
- The button is disabled (opacity 0.4) if no content is selected

### Processing State (Not Mocked)
- After submitting, the page transitions to a processing view
- Six stages shown as a horizontal checklist: CONVERT → PERSIST → CHUNK → RETRIEVE → ANALYZE → WRITE
- Each stage lights up (gray → red → gray check) as it completes
- The active stage pulses subtly
- On completion: auto-navigates to the Chapter Analysis page for the processed content

---

## Settings

### Connected Accounts
- OAuth providers shown as rows with: icon (20x20), provider name, connected identity (email/username), "Disconnect" action
- Icons: **Phosphor Icons** (`@phosphor-icons/react`) is the standard icon library for the app. For brand icons (Google, GitHub, etc.), use the official brand color SVGs or Phosphor's `ph-fill` weight where appropriate.
- Icon sizing: 20x20px for inline UI elements, 18px for OAuth provider buttons, 16px for form inputs

### AI API Keys
- Side-by-side explainer cards: Chat Model (red label, describes analysis/reasoning use) vs Embedding Model (gray label, describes vector/connection use)
- Explains the difference so users understand why two keys might be needed
- Key inputs show masked values in Departure Mono with provider badges (icon + name)

### Preferences
- Theme: Dark / Light / System segmented toggle
- Analysis depth: Brief / Standard / Deep — controls concept count and question density
- Auto-connect sources: toggle — automatically find connections via embeddings
- Spaced repetition reminders: toggle — schedule review sessions
- Export format: dropdown (Markdown default)

---

## Color System Reference

### Dark Mode (Primary)
| Role | Value | Usage |
|------|-------|-------|
| Base | `#131316` | Page backgrounds |
| Sidebar | `#0e0e11` | Sidebar background (darker than base) |
| Surface | `#1a1a1e` | Cards, rows, input backgrounds |
| Border | `#2a2a30` | Borders, dividers, separators |
| Mid | `#64646c` | Secondary text, inactive elements |
| Light mid | `#a0a0a8` | Tertiary text, labels, metadata |
| Body text | `#c8c8d0` | Primary body text on dark |
| Heading text | `#e8e8ec` | Headings, primary text, active items |
| Accent | `#c8352e` | Primary actions, active states, alerts |
| Accent dark | `#8b2520` | Pressed states, secondary accent |

### Light Mode
| Role | Value | Usage |
|------|-------|-------|
| Light cream | `#f7f3ed` | Page backgrounds |
| Cream | `#f0ebe4` | Surface/card backgrounds |
| Border | `#d4cfc8` | Borders, dividers |
| Text | `#1a1714` | Primary text (warm carbon) |

### Thermal Retention Scale (Knowledge Map)
| State | Value | Meaning |
|-------|-------|---------|
| Strong | `#4a4a52` | Well-retained, not due |
| Moderate | `#8b4a47` | Starting to decay |
| Decaying | `#a05550` | Should review soon |
| Due | `#c8352e` | Due for review now |
| Overdue | `#c8352e` + glow | Past due, pulsing |

---

## Typography Reference

| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Display XL | PP Neue York Normal | 800 | 48px | All-caps, tight tracking |
| Display | PP Neue York Normal | 800 | 32-36px | Page titles, all-caps |
| Heading | PP Neue York Normal | 800 | 20-28px | Section headers |
| Body | Karla | 400 | 15-16px | Primary reading text |
| Body small | Karla | 400 | 13-14px | Secondary text, descriptions |
| Label | Karla | 600-700 | 11px | Uppercase, 0.08-0.1em tracking |
| UI text | Karla | 500 | 13-14px | Buttons, nav items, tabs |
| Data | Departure Mono | 400 | 11-13px | Numbers, IDs, types, counts |
| Data large | Departure Mono | 400 | 28px | Stat tiles on review landing |

---

## Icons

### Icon Library
- **Primary**: [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`)
- **Weights used**: Regular (default), Bold (emphasis), Fill (selected/active states)
- **Sizes**: 16px (form inputs), 18px (buttons), 20px (navigation), 24px (feature highlights)

### Brand Icons
- OAuth providers (Google, GitHub, etc.) use their official brand colors/SVGs
- Brand icons should maintain their recognizable colors while fitting the overall dark aesthetic
- Size: 18px for OAuth buttons, 20px for connected account rows

---

## Command Palette (⌘K)

The command palette is the primary keyboard-driven navigation and action surface. It overlays the current page with a scrim (`rgba(10,10,13,0.7)`) and is dismissed with Escape.

### What It Searches

- **Actions**: Start review session (scoped to tag, source, or all), add source, export, open settings
- **Sources**: by title, type, or tag — shows source type badge and due count
- **Concepts**: by name — shows tier badge (CORE/SUPPORTING/ADVANCED) and source attribution
- **Chapters**: by title — shows source abbreviation and chapter number
- **Questions**: by text — shows tier and source
- **Tags**: by name — shows usage count

### Three Design Directions Under Consideration

#### A: Terminal

Console-inspired. The input uses Departure Mono with a red `▸` prompt and blinking cursor. Results are numbered (`01`, `02`, `03`...) and grouped under category headers (`ACTIONS`, `SOURCES`, `CONCEPTS`) in Departure Mono uppercase. The active result has a `#1a1a1e` background fill with the index number in red. A scope bar below the input shows the current search scope (`ALL SOURCES`) with a `TAB` key to cycle scopes.

**Strengths**: most consistent with the mission-control aesthetic. Numbered results enable keyboard-driven selection (type number to jump). The monospace input feels deliberate and precise.

**Risks**: numbered indices may feel overly technical for non-power-users. The monospace input is less comfortable for long queries.

#### B: Spotlight

Editorial-inspired. Large search input uses PP Neue York at 22px — the palette feels like a search moment, not a terminal session. Results are a flat list mixing sources (with metadata subtitle: chapter count, concept count, tags) and concepts (with tier badges). Footer shows scope filters as inline toggleable text (`Sources · Concepts · All`).

**Strengths**: warmest and most approachable. The PP Neue York input gives the palette a distinct personality vs the rest of the UI. Metadata subtitles surface useful context without requiring a preview pane. Feels natural for discovery-oriented searching.

**Risks**: less visually distinct from generic spotlight implementations. No preview means you commit to navigating before seeing content.

#### C: Dual-Pane

Search + results on the left (420px), live preview panel on the right (400px). The active result has a red left border accent. As the user arrows through results, the right pane updates with contextual detail:

- **For concepts**: tier badge, PP Neue York title, source attribution, definition + "why it matters" text, retention status (with thermal dot color), and "Connected to" list with retention dots
- **For sources**: source type, chapter count, overall retention bar, tag list, recent activity
- **For actions**: description of what the action does, current relevant state (e.g., "12 questions due in distributed-systems")

Footer includes a contextual action shortcut (`⌘↵ REVIEW NOW` when a due concept is focused).

**Strengths**: most informative — users can assess whether a result is what they want without navigating away. The preview pane reuses design patterns from the Knowledge Map detail panel. Contextual shortcuts (`⌘↵ REVIEW NOW`) turn the palette into a power tool, not just navigation.

**Risks**: wider footprint (820px vs 640-680px). Preview pane may feel empty for simple results like actions or tags. More complex to implement.

### Shared Behavior (All Directions)

- **Activation**: `⌘K` globally, including during review sessions
- **Scrim**: `rgba(10,10,13,0.7)` with optional `backdrop-filter: blur(8px)` (Direction A uses blur, B and C don't)
- **Keyboard**: `↑↓` to navigate, `↵` to select/open, `Esc` to close, `Tab` to cycle scope
- **Recency weighting**: recently visited items rank higher for the same match quality
- **Empty state**: when no query is entered, show recent items and suggested actions ("12 questions due — start review?")
- **Animation**: palette scales from 0.98 to 1.0 with opacity fade over ~150ms on open. Results stagger in with 20ms delay. `prefers-reduced-motion`: instant render
- **Scoping**: user can narrow search to a specific category. In A, `Tab` cycles the scope bar. In B, footer filters toggle. In C, scope is implicit from result selection

---

## Sign In (Access Terminal)

Implementation plan:
- See `AUTH_PLAN.md` for the execution plan that turns this design into frontend, auth, and Rails integration work.

### Layout
Split-screen, full-bleed dark. Left half (~760px): brand atmosphere. Right half (~680px): auth panel on a slightly lighter surface (`#131316` vs `#0e0e11`), separated by a `#2a2a30` vertical border.

### Left Half — Brand + Dormant Constellation

**Top**: Autodidact wordmark in PP Neue York Normal Extrabold at 52px, uppercase. Below it, a single-sentence value prop in Karla 16px `#64646c`.

**Middle — WebGL Constellation Shader (Overdrive)**:
The centerpiece of the left half is a dormant Knowledge Map — a WebGL-rendered force-directed graph in standby mode. This is the same rendering system as the Knowledge Map page, but in an unauthenticated "cold" state:

- **Nodes**: ~15-20 dim circles (`#2a2a30`) at varying sizes (3-6px radius), positioned by a frozen d3-force layout
- **Edges**: faint traces (`#1a1a1e`, 0.75px) connecting nodes — the graph structure is visible but lifeless
- **Single red pulse**: one node glows red (`#c8352e`) with a slow radial pulse (2s cycle, ease-in-out). This is the system asking for authentication — the one active signal in an otherwise dormant field
- **Shader effects**:
  - Subtle depth-of-field: nodes at the edges of the field are slightly blurred (gaussian, 1-2px), creating focal depth
  - Faint scan line effect: a horizontal line of slightly increased brightness sweeps vertically across the constellation every ~8 seconds, like a CRT refresh or radar sweep
  - Very subtle noise grain overlay (0.02 opacity) for texture
- **Mouse interaction**: nodes drift lazily away from the cursor (inverse gravity, low force), creating a sense of presence without demanding engagement. `prefers-reduced-motion`: static, no drift
- **On successful auth**: all nodes simultaneously pulse from `#2a2a30` → `#c8352e` → `#4a4a52` (the "online" color) over 800ms, edges illuminate in a sweep from center outward, then the entire left panel crossfades into the sidebar + dashboard via View Transitions API

**Bottom**: Boot sequence — five system status rows in Departure Mono 11px. Each row: system name (left), dotted leader line, status (right). First four systems show `STANDBY` in `#a0a0a8`. Last row (`OPERATOR AUTH`) shows `REQUIRED` in `#c8352e`.

**Decorative**: Registration marks (crosshair circles) at top-left and bottom-left corners in `#2a2a30`. Faint blueprint grid overlay via `repeating-linear-gradient` at ~0.15 opacity.

### Right Half — Auth Panel (OAuth-Only)

Vertically centered, 380px wide. No email/password — authentication is entirely via OAuth providers.

**Tabs**: Sign In / Sign Up as a two-tab toggle. Active tab: Karla 13px semibold `#e8e8ec` uppercase with 2px `#c8352e` bottom border. Inactive tab: Karla 13px medium `#64646c` with 1px `#2a2a30` bottom border. Both tabs trigger the same OAuth flow — the distinction is purely copy-level (adjusts the description text) so new users don't feel lost.

**Header**: "OPERATOR AUTHENTICATION" label in Departure Mono 10px `#64646c` with 0.12em tracking. Below it, contextual description in Karla 14px `#a0a0a8`:
- Sign In tab: "Sign in with your existing account to resume your session."
- Sign Up tab: "Create a new account to get started."

**OAuth Buttons**: Two full-width provider buttons (GitHub, Google). `#1a1a1e` background, `#2a2a30` border, 3px border-radius. Centered icon placeholder (18px circle) + provider name in Karla 14px medium `#e8e8ec`. Hover: border brightens to `#64646c`. Active: background `#232328`.

**Footer**: "By continuing, you agree to the Terms of Service" in Karla 12px `#64646c`, centered.

### Auth → Dashboard Transition (View Transitions API)

On successful authentication (after OAuth redirect returns):
1. Left constellation ignites — all nodes simultaneously pulse from `#2a2a30` → `#c8352e` → `#4a4a52` (the "online" color) over 800ms, edges illuminate in a sweep from center outward
2. Boot sequence status values flip from `STANDBY` → `ONLINE` in rapid succession (50ms apart), color changing from `#a0a0a8` → `#c8352e` → `#a0a0a8`
3. The right auth panel morphs into the sidebar via `view-transition-name: sidebar` — it slides left, narrows from 680px to 240px, and its content crossfades to the navigation items
4. The left half expands to fill the remaining space as the dashboard content fades in
5. Total transition: ~1.5 seconds
6. `prefers-reduced-motion`: instant cut to dashboard, no animation

### First Visit vs Return

- **First visit**: full boot sequence plays, constellation assembles node by node (300ms stagger)
- **Return visit** (cookie/localStorage detected): constellation is already assembled and gently drifting, boot sequence is already rendered. No entrance animation — the page is ready immediately. If session is still valid, auto-redirect to dashboard without showing sign-in at all

### Responsive (Mobile)

- Layout stacks vertically: constellation becomes a narrow horizontal strip (full-width, 120px tall) above the auth panel
- Boot sequence moves below the auth form
- Registration marks hidden
- Constellation shader runs at reduced node count (~8 nodes) for performance
