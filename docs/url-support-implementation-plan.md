# URL Support Implementation Plan for Autodidact

## Overview
This document outlines a comprehensive multiphase plan to add URL detection and scanning capabilities to the autodidact project using the nous gem. The plan enhances the existing input handling architecture to support web content alongside file-based and raw text inputs.

## Current State Analysis

### Autodidact Project
- **Input Types**: Currently supports file paths and raw text
- **Architecture**: Well-structured command pattern with separation of concerns
- **File Detection**: Uses regex patterns for URL and file path detection
- **Conversion Pipeline**: TextConverter, PdfConverter, RawTextConverter
- **Storage**: SourceBlob model with metadata support

### Nous Gem Capabilities
- **URL Fetching**: Single-page and recursive crawling
- **Content Extraction**: Readability-based HTML to Markdown conversion
- **Multiple Extractors**: Default (Readability) and Jina API for JS-heavy sites
- **Configuration**: Concurrency, timeout, limits, and filtering options
- **Error Handling**: Robust network error handling and validation

## Multiphase Implementation Plan

### Phase 1: Input Type Detection Enhancement
**Goal**: Enable URL detection and routing to URL processing pipeline

**Files to Modify**:
- `lib/autodidact/commands/detect_input_type.rb`
  - Update `SUPPORTED_INPUT_TYPES` to include "url"
  - Remove unsupported input type restriction
  - Add URL-specific validation

- `lib/autodidact/commands/analyze_source.rb`
  - Add URL case in the `convert` method
  - Route URLs to new URL processing pipeline

**Key Changes**:
```ruby
# Add URL support
SUPPORTED_INPUT_TYPES = %w[url file_path raw_text].freeze
```

### Phase 2: URL Processing Infrastructure
**Goal**: Create URL processing pipeline using nous gem

**New Files to Create**:
- `lib/autodidact/convert/url_converter.rb`
  - Fetches URL content using nous gem
  - Handles single-page vs recursive crawling options
  - Converts nous output to autodidact format

- `lib/autodidact/provider/url_fetcher.rb`
  - Wraps nous gem API
  - Handles configuration and error handling
  - Provides options for timeout, concurrency, etc.

**Key Features**:
- Single URL fetch vs recursive crawling
- Configurable timeout and concurrency
- Error handling for network failures
- Content type validation (HTML only)

### Phase 3: Integration and Configuration
**Goal**: Integrate URL processing with existing autodidact architecture

**Files to Modify**:
- `lib/autodidact/config/http_connection.rb`
  - Add URL-specific configuration options
  - Configure nous gem settings

- `lib/autodidact/primitives/conversion_result.rb`
  - Add URL-specific metadata handling
  - Support for fetched content timestamps

- `lib/autodidact/commands/detect_source.rb`
  - Update to handle URL sources
  - Add URL validation logic

### Phase 4: TUI Enhancement
**Goal**: Update user interface to support URL input

**Files to Modify**:
- `tui/src/screens/source-input/use-badges.ts`
  - Add URL badge type
  - Update input detection patterns

- `tui/src/screens/source-input/index.tsx`
  - Add URL validation UI
  - Handle URL-specific error states

### Phase 5: Testing and Error Handling
**Goal**: Comprehensive testing and robust error handling

**New Test Files**:
- `spec/convert/url_converter_spec.rb`
- `spec/provider/url_fetcher_spec.rb`
- `spec/commands/analyze_source_url_spec.rb`

**Error Handling Features**:
- Network timeout handling
- Invalid URL validation
- Content type rejection (non-HTML)
- Recursive crawl limits
- Rate limiting and retry logic

## Technical Architecture

### URL Processing Flow:
1. **Input Detection**: `detect_input_type.rb` identifies URL input
2. **URL Processing**: `url_converter.rb` uses `url_fetcher.rb`
3. **Content Fetching**: `Nous.fetch()` retrieves and extracts content
4. **Conversion**: Convert nous output to autodidact format
5. **Storage**: Persist as source blob with URL metadata
6. **Analysis**: Process extracted content for note generation

### Configuration Options:
```ruby
# URL-specific settings
config = {
  url_timeout: 30,           # Seconds
  url_concurrency: 5,        # For recursive crawling
  url_limit: 20,             # Max pages for recursive crawling
  url_recursive: false,      # Single vs recursive fetch
  url_selector: nil,         # CSS selector for content scoping
  url_jina: false            # Use Jina extractor for JS-heavy sites
}
```

## Benefits and Trade-offs

### Benefits:
- **Enhanced Capabilities**: Web content support alongside files
- **Robust Extraction**: Readability-based content extraction
- **Flexible Options**: Single vs recursive crawling
- **Performance**: Configurable concurrency and timeouts
- **Clean Architecture**: Modular design with clear separation of concerns

### Trade-offs:
- **Network Dependencies**: Requires internet connectivity
- **Rate Limiting**: Need to handle API rate limits
- **Content Quality**: Web content may be less structured than files
- **Performance**: Network operations add latency

## Implementation Timeline

**Phase 1-2**: 2-3 days (Core URL detection and processing)
**Phase 3-4**: 1-2 days (Integration and UI updates)  
**Phase 5**: 1 day (Testing and error handling)

**Total Estimated Time**: 4-6 days

## Dependencies Required

### New Dependencies:
- `nous` (0.1.0 or later)
- `faraday` (already included)
- `faraday-net_http` (already included)
- `nokogiri` (for HTML parsing)
- `readability` (for content extraction)

### Configuration Changes:
- Update Gemfile to include nous gem
- Update autodidact.gemspec for new dependency

## Integration Points

### With Existing Autodidact Features:
- **Source Detection**: Extends existing file detection patterns
- **Conversion Pipeline**: Adds new URL converter to existing architecture
- **Storage System**: Uses existing SourceBlob model with URL metadata
- **TUI Interface**: Enhances existing input detection with URL support

### With Nous Gem:
- **API Integration**: Uses `Nous.fetch()` as primary interface
- **Configuration**: Maps autodidact config to nous settings
- **Error Handling**: Leverages nous error handling patterns
- **Content Extraction**: Uses nous's Readability-based extraction

## Success Criteria

### Functional Requirements:
- [ ] URLs are correctly detected and classified
- [ ] URL content is fetched and extracted successfully
- [ ] Extracted content is converted to autodidact format
- [ ] URL sources are stored with appropriate metadata
- [ ] TUI interface supports URL input with validation
- [ ] Error handling covers network failures and invalid URLs

### Quality Requirements:
- [ ] All tests pass (existing and new URL-specific tests)
- [ ] Performance meets acceptable standards for network operations
- [ ] Error messages are clear and helpful
- [ ] Configuration options are well-documented
- [ ] Backward compatibility with existing file-based input is maintained

## Next Steps

1. Review and approve this implementation plan
2. Create feature branch for URL support development
3. Begin Phase 1 implementation (input type detection enhancement)
4. Progress through remaining phases with testing at each stage
5. Conduct integration testing and performance validation
6. Merge to main branch and update documentation

This plan provides a comprehensive, modular approach to adding URL support to autodidact while leveraging the robust nous gem for content extraction. The phased approach allows for incremental development and testing, ensuring each component works correctly before moving to the next phase.