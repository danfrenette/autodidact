# Autodidact Context

## Domain Terms

### Source lifecycle

The Source lifecycle is the status path for a Source as it moves through intake and processing.

A Source starts as `draft`, moves to `uploading` when created through intake, moves to `uploaded` after an asset is attached, moves to `processing` when selected chapters are queued, and eventually derives `complete` or `failed` from its SourceSelections.

`complete` and `failed` are terminal lifecycle statuses unless retry or reprocessing is explicitly added later.
