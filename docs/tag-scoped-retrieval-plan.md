# Tag-Scoped Chunk Retrieval Plan

## Goal

When a user generates a note with tags, find other source blobs sharing those tags,
retrieve the most relevant chunks, and inject them into the LLM prompt so Tier 4
"Connections" questions reference *actual material the user has studied* rather than
generic cross-domain guesses.

## Current State

- Tags are user-supplied strings, stored in `tags` table with many-to-many join to `source_blobs`
- `source_blobs.raw_text` stores the full extracted text (no chunking)
- No vector/embedding infrastructure exists
- Pipeline: Convert → Persist blob → Generate note → Render → Write

## Revised Pipeline

Convert → Persist blob → **Persist chunks** → **Retrieve related chunks** → Generate note (enhanced prompt) → Render → Write

---

## Phase 1: Chunking Infrastructure (current)

### 1a. Migration `004_create_source_chunks.rb`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `source_blob_id` | `uuid` | FK → source_blobs, NOT NULL |
| `chunk_index` | `integer` | Position within the source (0-based), NOT NULL |
| `content` | `text` | The chunk text (~500 tokens), NOT NULL |
| `created_at` | `timestamp` | |

Index on `source_blob_id`. (Vector column added in Phase 4.)

### 1b. `Models::SourceChunk`

Sequel model. `many_to_one :source_blob`. Update `SourceBlob` with `one_to_many :source_chunks`.

### 1c. `Chunking::TextChunker`

- Input: `raw_text` string
- Output: array of `{ content:, chunk_index: }` structs
- Strategy: ~500-token chunks with ~50-token overlap at paragraph boundaries
- Falls back to sentence boundaries, then hard split at token limit

### 1d. `Storage::PersistSourceChunks` command

- Input: `source_blob_id:, raw_text:`
- Chunks text via `TextChunker`, bulk-inserts into `source_chunks`
- Called from `AnalyzeSource` immediately after `PersistSourceBlob`

---

## Phase 2: Tag-Scoped Retrieval

### 2a. `Retrieval::RelatedChunks` query

- Input: `source_blob_id:, tags:, limit: 20`
- Find chunks from source_blobs sharing any selected tags, excluding current blob
- Order: `created_at DESC` (most recent first — crude; vectors improve this later)
- Distribute chunks across sources (don't return 20 chunks from one blob)
- Returns: `[{ content:, source_path:, chunk_index: }]`

---

## Phase 3: Prompt Enhancement

### 3a. `FixedPrompt.call(raw_text:, related_chunks: [])`

When `related_chunks` is non-empty, inject a "Related Material" section before
the source text. Group chunks by source_path. Instruct the LLM to use this
material specifically for Tier 4 Connections.

### 3b. `GenerateNoteContent`

Accept `related_chunks:` parameter, pass through to `FixedPrompt`.

### 3c. `AnalyzeSource` orchestration

Wire in: persist chunks after persist blob, retrieve related before generate.
New TUI stage: `"retrieving"` between persist and analyze.

---

## Phase 4: Vector Ranking (future — not this PR)

- Add `pgvector` extension + `embedding vector(1536)` column to `source_chunks`
- Add `sequel-pgvector` gem
- Add `Provider::EmbeddingClient` wrapping OpenAI `text-embedding-3-small`
- Modify `PersistSourceChunks` to generate embeddings at insert time
- Modify `RelatedChunks` to rank by cosine similarity instead of recency
- Backfill task for existing chunks

---

## File Inventory

### New files

| File | Purpose |
|------|---------|
| `db/migrate/004_create_source_chunks.rb` | source_chunks table |
| `lib/autodidact/models/source_chunk.rb` | Sequel model |
| `lib/autodidact/chunking/text_chunker.rb` | Text splitter |
| `lib/autodidact/storage/persist_source_chunks.rb` | Chunk + store command |
| `lib/autodidact/retrieval/related_chunks.rb` | Tag-scoped retrieval query |
| Specs for each of the above | |

### Modified files

| File | Change |
|------|--------|
| `lib/autodidact/commands/analyze_source.rb` | Wire in chunk persistence + retrieval |
| `lib/autodidact/analysis/fixed_prompt.rb` | Accept + render related chunks |
| `lib/autodidact/analysis/generate_note_content.rb` | Accept related_chunks param |
| `lib/autodidact/models/source_blob.rb` | Add `one_to_many :source_chunks` |

### No TUI changes needed

The TUI already sends tags. The backend does all the new work.

---

## Design Decisions

- **Tags narrow, vectors rank**: Tags define the search space, vectors (Phase 4) will rank within it
- **Chunk at persist time**: Synchronous — adds latency but embeddings/chunks are always fresh
- **~500-token chunks with ~50-token overlap**: Standard RAG chunk size; paragraph-aware splitting
- **OpenAI text-embedding-3-small** (Phase 4): 1536 dims, cheap, already have SDK wired up
- **Raw SQL for vector ops** OR `sequel-pgvector` (Phase 4): TBD, user prefers trying sequel-pgvector
- **No embedding of generated notes**: Embed raw source only (for now)
