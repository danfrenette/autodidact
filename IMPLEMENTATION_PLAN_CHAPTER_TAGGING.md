# Implementation Plan: Chapter-Level Tagging

## Overview
Enable users to tag individual source selections (chapters) during source intake, with bulk tagging support and autocomplete from existing user tags.

## Architecture Decisions
- Param structure: Flat array with tags nested in selection objects
- Source tags and selection tags are independent but complementary
- Bulk tagging appends tags (non-destructive)
- Row interaction: checkbox/title = select, tag area = expand
- Tag area shows first tag + count badge + "+" button
- Autocomplete: all user tags sorted by frequency
- API: Single POST with nested tags
- Removal: Immediate delete, "No tags" placeholder

---

## Phase 1: Backend (2-3 days)

### Task 1.1: Update Model Associations (30 min)
**Files:** `app/models/source_selection.rb`, `app/models/tag.rb`

```ruby
# source_selection.rb
has_many :taggings, as: :taggable, dependent: :destroy
has_many :tags, through: :taggings

# tag.rb  
has_many :source_selections, through: :taggings, 
         source: :taggable, source_type: "SourceSelection"
```

**Tests:** Verify associations work, test dependent: :destroy

### Task 1.2: Update Sources::Create Service (2-3 hours)
**Files:** `app/services/sources/create.rb`

Modify `create_selections_with_tags` method to handle nested tags:
```ruby
def create_selections_with_tags(source)
  selection_params.each do |params|
    tag_names = params.delete(:tags) || []
    selection = source.source_selections.create!(params)
    
    tag_names.each do |tag_name|
      tag = Tag.find_or_create_by!(user: user, name: Tag.normalize_name(tag_name))
      selection.taggings.create!(tag: tag)
    end
  end
end
```

**Tests:** 
- Create source with tagged selections
- Handle empty tags array
- Handle duplicate tag names (idempotent)
- Verify tags are user-scoped

### Task 1.3: Update Controller Strong Params (30 min)
**Files:** `app/controllers/api/sources_controller.rb`

Update `source_selection_params` to permit tags:
```ruby
selections: [
  :kind, :title, :label, 
  { position: {}, locator: {} },
  { tags: [] }
]
```

**Tests:** Verify params flow through correctly

### Task 1.4: Update JBuilder Serializers (1-2 hours)
**Files:** `app/views/api/sources/_source.json.jbuilder`, `app/views/api/sources/show.json.jbuilder`

Include tags in selection serialization:
```ruby
json.selections source.source_selections do |selection|
  json.extract! selection, :id, :kind, :title, :label, :status
  json.position selection.position.to_h
  json.locator selection.locator.to_h
  json.tags selection.tags.map(&:name)
end
```

**Tests:** Verify API response includes tags

### Task 1.5: Add Tags Autocomplete Endpoint (1-2 hours)
**Files:** New endpoint `GET /api/tags`

Returns all user's tags sorted by usage frequency:
```ruby
def index
  tags = current_user.tags
    .left_joins(:taggings)
    .group('tags.id')
    .order('COUNT(taggings.id) DESC')
    .pluck(:name)
  
  render json: { tags: tags }
end
```

**Tests:** Verify sorting, verify user scoping

---

## Phase 2: Frontend - Core Components (2-3 days)

### Task 2.1: Create CompactTagInput Component (3-4 hours)
**Files:** `web/src/components/tags/CompactTagInput.tsx`

Props:
```typescript
interface CompactTagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  availableTags: string[]; // For autocomplete
  placeholder?: string;
}
```

Features:
- Inline tag pills with X button
- Input field at end
- Autocomplete dropdown
- Keyboard: Enter to add, Backspace on empty to remove last

**Tests:** Component tests for add/remove/autocomplete

### Task 2.2: Create ExpandableChapterRow Component (4-5 hours)
**Files:** `web/src/features/sources/components/ExpandableChapterRow.tsx`

Props:
```typescript
interface ExpandableChapterRowProps {
  selection: SourceSelection;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateTags: (tags: string[]) => void;
  availableTags: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}
```

Layout:
- Checkbox zone (left) - toggles selection
- Title/subtitle zone (center-left) - toggles selection  
- Tag area (center-right) - shows first tag + count + "+", toggles expand
- Concept count (right) - informational

Expanded state:
- Slides down with CompactTagInput
- Shows "Tags for this chapter" label

**Tests:** Interaction tests for zones, expansion animation

### Task 2.3: Create BulkTagModal Component (3-4 hours)
**Files:** `web/src/features/sources/components/BulkTagModal.tsx`

Props:
```typescript
interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onApplyTags: (tags: string[]) => void;
  availableTags: string[];
}
```

Features:
- Shows "Apply tags to N selected chapters"
- CompactTagInput for entering tags
- "Apply" and "Cancel" buttons

**Tests:** Modal open/close, tag application

---

## Phase 3: Frontend - Integration (2-3 days)

### Task 3.1: Update SourceSelectionsList (4-5 hours)
**Files:** `web/src/features/sources/components/SourceSelectionsList.tsx`

Changes:
- Replace flat list with ExpandableChapterRow components
- Track expanded row ID (only one expanded at a time?)
- Add expanded state management
- Update tag handling per selection

Bulk bar:
- Show selected count
- "Select All", "Clear", "Tag Selected" buttons
- Wire up BulkTagModal

**Tests:** Integration tests for selection + tagging flow

### Task 3.2: Update AddSource Flow (3-4 hours)
**Files:** `web/src/features/sources/pages/AddSource.tsx`, `web/src/features/sources/hooks/useCreateSource.ts`

Changes:
- Include tags in selection payload
- New structure:
```typescript
{
  source: { title, author, ... },
  selections: [
    { title, position, locator, tags: ['distributed-systems'] },
    ...
  ],
  tags: ['textbooks'] // Source-level tags (still supported)
}
```

**Tests:** E2E test for full source creation with tagged chapters

### Task 3.3: Add Tags Autocomplete Hook (1-2 hours)
**Files:** `web/src/features/tags/hooks/useUserTags.ts`

Fetches and caches user's tags for autocomplete:
```typescript
const useUserTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-tags'],
    queryFn: fetchUserTags,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return { tags: data || [], isLoading };
};
```

**Tests:** Hook test for caching behavior

---

## Phase 4: Polish & Edge Cases (2 days)

### Task 4.1: Animations (3-4 hours)
- Row expand/collapse: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Tag pill appear: 150ms fade + scale
- Tag removal: 100ms shrink
- Use CSS transitions, Framer Motion, or Tailwind animations

### Task 4.2: Tooltips (2-3 hours)
**Files:** `web/src/components/tags/TagTooltip.tsx`

Shows on hover of tag pill:
- Tag name (large)
- Description (if exists)
- "Also appears in: Chapter 3, Chapter 7, +2 more"

Fetch related chapters via API or derive from current data

### Task 4.3: Error Handling (2-3 hours)
- Network failure during tag add: Retry or show error
- Invalid tag name (too long, invalid chars): Validate client-side
- Duplicate tag: Silently dedupe on client
- Server error: Show toast, don't lose tag input state

### Task 4.4: Empty & Loading States (2-3 hours)
- Empty tags: Show "No tags" in muted text
- Loading tags: Skeleton or spinner in tag area
- No user tags yet: Autocomplete shows "Type to create your first tag"

---

## Phase 5: Testing & QA (2 days)

### Task 5.1: Backend Tests (4-5 hours)
- Model associations
- Service object with nested tags
- Controller params handling
- API response format
- Tag autocomplete endpoint

### Task 5.2: Frontend Unit Tests (4-5 hours)
- CompactTagInput interactions
- ExpandableChapterRow zone clicking
- BulkTagModal apply/cancel
- Hook tests

### Task 5.3: Integration Tests (4-5 hours)
- Full source creation flow
- Tag persistence across page reload
- Bulk tagging multiple chapters
- Tag removal and empty state

### Task 5.4: Manual QA Checklist (2-3 hours)
- Create source with 10+ tagged chapters
- Test bulk tag on subset
- Test keyboard navigation
- Test on mobile viewport
- Verify animations are smooth

---

## Total Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Backend | 2-3 days | 2-3 days |
| Frontend Core | 2-3 days | 4-6 days |
| Frontend Integration | 2-3 days | 6-9 days |
| Polish | 2 days | 8-11 days |
| Testing | 2 days | 10-13 days |

**Realistic estimate: 2 weeks** (with buffer for review/iteration)

---

## Open Questions to Resolve

1. **Can multiple rows be expanded simultaneously?** 
   - Recommended: No, only one expanded at a time for cleaner UI
   
2. **Max tags per chapter?**
   - Recommended: No hard limit, but UI constrains visually (wraps)
   
3. **Tag name validation rules?**
   - Current: normalize to lowercase, hyphens for spaces
   - Max length? Special chars allowed?
   
4. **Should we show tag suggestions based on chapter title?**
   - Maybe later with ML, not for MVP

---

## Success Criteria

- [ ] User can tag individual chapters during source intake
- [ ] Tags are persisted and returned in API
- [ ] Bulk tagging works for multiple chapters
- [ ] Autocomplete shows existing tags
- [ ] Tooltips show tag info + related chapters
- [ ] Empty state is clear
- [ ] Animations are smooth
- [ ] All tests pass
