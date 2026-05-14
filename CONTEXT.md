# Autodidact Context

## Domain Terms

### Source lifecycle

The Source lifecycle is the status path for a Source as it moves through intake and processing.

A Source starts as `draft`, moves to `uploading` when created through intake, moves to `uploaded` after an asset is attached, moves to `processing` when selected chapters are queued, and eventually derives `complete` or `failed` from its SourceSelections.

`complete` and `failed` are terminal lifecycle statuses unless retry or reprocessing is explicitly added later.

### Processing Pipeline

The six-stage pipeline that transforms source content into structured knowledge.

**CONVERT**: Transforms source media (PDF, audio, video, URL) into plain text using the Substrate gem.

**PERSIST**: Stores the converted text content as raw data associated with the SourceSelection.

**CHUNK**: Creates vector embeddings of the content and stores them for semantic retrieval. This enables similarity search across all sources using tags as centroids — tags define conceptual clusters that retrieve related information from the vector store.

**RETRIEVE**: Queries the vector store using tag centroids to fetch related concepts and content from other sources that share those tags.

**ANALYZE**: Compares the current SourceSelection's content against retrieved related content to identify similarities, connections, and synthesis opportunities.

**WRITE**: Produces the final structured data: Concepts (with CORE/SUPPORTING/ADVANCED classification), Questions (retrieval practice), and Quotes (citations with references back to source storage).

### Source Chunk

A Source Chunk is a token-bounded excerpt of persisted SourceSelection text used for retrieval and cross-source analysis.

Source Chunks are created from SourceSelection Content after text is persisted. Each chunk preserves enough location metadata to map back to the SourceSelection Content it was derived from, and each chunk can be embedded for vector similarity search.

Tags narrow the retrieval space; vector similarity ranks chunks within that tag-scoped candidate set. This keeps related-material retrieval grounded in user-assigned topics while still allowing semantic ranking.

When processing a SourceSelection, retrieval uses that SourceSelection's tags if any are present. If the SourceSelection has no tags, retrieval falls back to the parent Source's tags.

Related chunk retrieval should start with a small, changeable policy: retrieve up to 20 related chunks and cap results to 3 chunks per related Source. The retrieval policy is expected to change often and should be isolated behind a dedicated service or policy object rather than embedded in the job orchestration.

### Source Material Identity

Source Material Identity is the system's lightweight determination that two attempted file intakes refer to the same uploaded asset.

Autodidact should compare uploaded file checksums to avoid obvious duplicate Source records. This is a quality-of-life guardrail, not a hard semantic identity system. The system should not perform expensive converted-content comparison for dedupe unless duplicate source material becomes a proven product problem.

When an uploaded file checksum matches an existing Source for the same user, intake should block duplicate creation and direct the user to the existing Source. Retrying or reprocessing should happen through explicit actions on the existing Source or SourceSelection.

### SourceSelection Content

SourceSelection Content is the persisted text representation of a selected region of a Source, such as a chapter page range extracted from a PDF.

It is produced during the CONVERT/PERSIST stages after the user has selected SourceSelections for processing. It should be stored separately from SourceSelection metadata so later chunking, retrieval, citation lookup, and re-analysis can use the same converted text without rerunning source conversion.

For the MVP, reprocessing a SourceSelection replaces the current SourceSelection Content, Source Chunks, Concepts, Questions, and Quotes in place. Autodidact should not preserve historical analysis versions until versioned processing becomes an explicit product requirement.

SourceSelection Content should include generalized Locator Spans: byte ranges in the persisted text mapped back to the original source location. For PDFs, locator spans map text bytes to page numbers. For transcripts, they can map text bytes to timestamps. For articles or URLs, they can map text bytes to sections or anchors.

AI citations should reference Source Chunks. The backend resolves a cited chunk to user-facing source locations by intersecting the chunk byte range with the SourceSelection Content's Locator Spans.

### Citation

A Citation is a structured reference from generated analysis output back to a Source Chunk.

Concepts, Questions, and Quotes can each have Citations. Citations are stored as rows rather than only inline JSON so the app can validate references, query cited material, and render user-facing source locations such as pages, timestamps, or article sections.

Citations can reference chunks from the current SourceSelection or from related SourceSelections retrieved for cross-source analysis. Quotes should cite only the current SourceSelection unless a future feature explicitly introduces related-source quotes.

### Analysis Policy

Analysis Policy is the code-level configuration that controls retrieval, prompt construction, response validation, and result writing for SourceSelection analysis.

For the MVP, analysis policy should live in isolated service objects rather than inline job orchestration or database-configured prompts. Retrieval limits, source diversity caps, prompt wording, JSON schema instructions, and write behavior are expected to change often.

Generated analysis output is not source material. Autodidact should not chunk or embed generated Concepts, Questions, or Quotes for the MVP. Chunking and embedding should stay grounded in converted SourceSelection Content.

The MVP embedding model is fixed rather than user-configurable because pgvector dimensions are schema-level concerns. The prototype uses OpenAI `text-embedding-3-small` with 1536-dimensional vectors, and the production schema should follow that unless a different fixed embedding model is deliberately chosen before implementation.

The MVP analysis model is fixed rather than user-selectable. Model selection can become a processing parameter after the JSON output, citation behavior, and write pipeline are reliable.

For the MVP, invalid AI JSON should fail the SourceSelection without writing partial Concepts, Questions, Quotes, or Citations. The implementation should leave a clear note at the failure point that repair/retry support can be added later if invalid output becomes common.

Successful CONVERT, PERSIST, and CHUNK artifacts should remain durable even if later ANALYZE or WRITE stages fail. Concepts, Questions, Quotes, and Citations should only be replaced after a complete AI response has passed validation.

Invalid AI output should store enough failure detail to debug prompt/schema issues without creating analysis history. A lightweight operational field such as `error_details` can hold validation errors and the raw failed response.
