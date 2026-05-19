# Tagging at Selection Level - Implementation Plan

## Problem Statement
Currently tags can only be associated with Sources as a whole. Users need to tag individual SourceSelections (chapters) because different chapters cover different topics.

Example: "Designing Data-Intensive Applications" has chapters on:
- Replication (distributed-systems)
- Storage and Retrieval (databases)
- Encoding and Evolution (data-formats)

Tagging the whole book as "distributed-systems" is misleading for the storage chapter.

## Technical Architecture

The `taggings` table is already polymorphic via `taggable`. We can tag any model.

### Required Changes

#### Backend

1. **Model associations**
   - Add `has_many :taggings, as: :taggable` to SourceSelection
   - Add `has_many :tags, through: :taggings` to SourceSelection
   - Add `has_many :source_selections, through: :taggings, source: :taggable, source_type: "SourceSelection"` to Tag

2. **Service layer**
   - Modify `Sources::Create` to accept `selection_tags` parameter
   - Structure: `{selection_index: [tag_names]}` or `{selection_label: [tag_names]}`
   - After creating selections, tag each one with its specified tags

3. **Controller**
   - Update `source_selection_params` to permit tags per selection
   - New structure: `selections: [:kind, :title, :label, {position: {}, locator: {}}, {tags: []}]`

4. **Serializer**
   - Update `_source.json.jbuilder` to include tags per selection (if needed)
   - Or create a separate selection serializer

#### Frontend

1. **Chapter selection UI**
   - Each chapter row needs a tag input
   - Compact design: small tag pills appear inline or on hover
   - Could be: click row to expand and show tag editor
   - Or: inline tag pills that are editable

2. **Tag input component**
   - Reuse the existing tag editor from Add Source page
   - Compact variant for chapter rows

3. **Data flow**
   - Build selection params to include tags array per selection
   - Submit with source creation

## UI Design Approach

The challenge: chapter list is already information-dense. Adding tag inputs to every row risks overwhelming the user.

### Option A: Expandable Row
- Chapter row looks normal
- Click to expand row, revealing tag editor below
- Saves vertical space, progressive disclosure
- Aligns with "order from chaos" principle

### Option B: Inline Compact Tags
- Show existing tags as small pills inline (if any)
- Click pill to edit
- Always visible, but takes horizontal space

### Option C: Batch Tag Mode
- Normal chapter selection
- After selecting chapters, enter "tag mode" where you tag each selected chapter
- Two-phase flow: select chapters → tag chapters

### Recommendation: Option A (Expandable Row)
- Clean default view
- Progressive disclosure when user needs detail
- Fits the neo-industrial "systems reveal" aesthetic

## Implementation Order

1. Backend: Add associations to SourceSelection and Tag models
2. Backend: Update Sources::Create service to handle selection tagging
3. Backend: Update controller strong params
4. Backend: Update jbuilder serializer
5. Frontend: Create compact tag input component
6. Frontend: Make chapter rows expandable
7. Frontend: Wire up tag submission
8. Tests: Add specs for selection tagging

## Migration Notes

No migration needed - the polymorphic taggings table already supports this. Just need to populate `taggable_type: "SourceSelection"` and `taggable_id: selection_id`.

## Open Questions

1. Should selections inherit source-level tags, or are they completely separate?
2. When viewing a chapter's detail page (concepts), should it show its tags?
3. Should the Knowledge Map connect via selection-level tags or source-level tags (or both)?

Recommendation: Keep them separate for now. Source tags = broad categorization. Selection tags = specific topic. Knowledge Map can aggregate both.
