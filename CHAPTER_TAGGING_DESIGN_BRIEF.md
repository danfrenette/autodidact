# Design Brief: Chapter-Level Tagging UI

## Feature Summary
Allow users to associate tags with individual SourceSelections (chapters/sections) during the intake flow. This provides granular topic classification—one chapter might be "distributed-systems" while another is "databases" within the same book.

## User Flow Context
This happens during the "Review & Select" phase of source intake, after chapters have been extracted but before the source is fully created.

## Current State
- Chapter list shows title, progress (extracted/total concepts), and checkbox for selection
- No tagging capability at chapter level
- Source-level tags appear at the top of the page

## Design Challenge
Add chapter tagging without overwhelming the chapter list. The chapter list is already dense with:
- Checkbox (select/deselect)
- Chapter title
- Concept count (extracted/total)
- Implicit: position/level indicators

## Proposed Interaction Models

### A. Expandable Chapter Row (Recommended)
**Default State**: Chapter looks like current design—just checkbox, title, count
**Expanded State**: Click chapter row to reveal tag editor below it
- Tag input field (compact)
- Existing tags as small pills
- "Add tag" button or inline input
**Animation**: Smooth height expansion, 200ms ease-out

**Pros**: Clean default view, progressive disclosure, space for tag input
**Cons**: Requires click to see/edit tags, discoverability concern

### B. Inline Compact Tags
**Default State**: Show existing tags as tiny pills inline with chapter title
- Truncated with "+N" overflow indicator
- Tags are clickable to edit
**Active State**: Inline tag input appears when editing

**Pros**: Always visible, no extra clicks to see tags
**Cons**: Consumes horizontal space, may truncate chapter titles

### C. Batch Tag Mode
**Phase 1**: User selects chapters as usual
**Phase 2**: "Tag Selected Chapters" mode activated
- Selected chapters highlighted
- Tag panel appears on right or bottom
- Apply tags to multiple selections at once

**Pros**: Efficient for bulk tagging, clean initial view
**Cons**: Two-phase flow adds friction, not good for one-off tagging

## Recommended Approach: A (Expandable Row) with C (Batch Mode) as Enhancement

**Phase 1**: Expandable row for individual chapter tagging
**Phase 2**: Add batch selection + bulk tag mode

## Key Design Decisions Needed

### 1. Tag Input Behavior
- **Inline typing**: Type and comma/enter creates tag immediately
- **Autocomplete dropdown**: Show existing user tags as suggestions
- **Pill creation**: Click "+" to open input, type, press enter

**Question**: Which interaction feels right? I'm leaning toward inline typing with autocomplete—fast for power users, discoverable for new users.

### 2. Tag Display in Collapsed State
Options:
- **None**: Tags only visible when expanded (cleanest)
- **Count badge**: Show "3 tags" as a subtle indicator
- **First tag + count**: Show primary tag and "+2" overflow
- **Heat map**: Tiny colored dots representing tag categories

**Question**: Should users see chapter tags at a glance, or is progressive disclosure acceptable?

### 3. Source-Level vs Chapter-Level Tags
- **Option 1**: Completely separate. Source tags = broad category. Chapter tags = specific topics.
- **Option 2**: Inherited. Chapter tags implicitly include source tags unless overridden.
- **Option 3**: Aggregated. Source tags auto-populate from chapter tags (union of all chapter tags).

**Question**: How do these two levels relate? My instinct: keep them separate for now. A book tagged "distributed-systems" might have chapters that aren't (preface, index). Chapter tags should be additive.

### 4. Keyboard Navigation
- Tab through chapters
- Space to expand/collapse
- Type to add tags when expanded
- Escape to collapse

**Question**: Is keyboard efficiency important here? Probably yes—intake flow should be fast.

## Visual Style Guidelines
- Tags should use the same color system as source tags
- Compact variant: smaller font (12px vs 14px), tighter padding
- Departure Mono for tag labels to maintain consistency
- Muted colors (neutrals) by default, no accent colors for tags
- Focus state: red border (#c8352e) when tag input is active

## Animation Specifications
- Row expand: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Tag pill appearance: 150ms fade + slight scale
- Tag removal: 100ms shrink
- Height animation uses max-height trick for smoothness

## Open Questions for You

1. **Should chapter tags be visible in the collapsed chapter list?** (Options: none / count only / first tag + count / heat dots)

2. **Tag input style**: Inline typing with autocomplete, or click-to-add with modal/popover input?

3. **Bulk tagging**: Is it important to tag multiple chapters at once with the same tags? Or is one-at-a-time sufficient for MVP?

4. **Edit post-creation**: Should users be able to add/remove chapter tags after the source is created? Or only during intake?

5. **Tag inheritance**: If a source is tagged "distributed-systems", should its untagged chapters implicitly have that tag? Or are chapter tags completely independent?

---

**Once you answer these, I'll create the Paper mockups with the specific interactions.**