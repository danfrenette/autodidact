# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Output::RenderNote do
  describe ".call" do
    let(:created_at) { Time.new(2025, 6, 15, 10, 30, 0) }

    it "renders frontmatter with tags, source, and created timestamp" do
      result = described_class.call(
        tags: %w[study chapter-review],
        source_path: "/path/to/file.txt",
        content: "Some analysis content",
        created_at: created_at
      )

      expect(result).to include("tags:")
      expect(result).to include("  - study")
      expect(result).to include("  - chapter-review")

      expect(result).to include('source: "/path/to/file.txt"')
      expect(result).to include("created:")
    end

    it "includes the analysis content in the body" do
      result = described_class.call(
        tags: ["autodidact"],
        source_path: "/file.txt",
        content: "## Key Ideas\n- idea one\n- idea two",
        created_at: created_at
      )

      expect(result).to include("## Key Ideas")
      expect(result).to include("- idea one")
      expect(result).to include("- idea two")
    end

    it "separates frontmatter from content with a blank line" do
      result = described_class.call(
        tags: ["test"],
        source_path: "/file.txt",
        content: "body text",
        created_at: created_at
      )

      expect(result).to match(/---\n\nbody text/)
    end

    it "renders empty tags section when no tags provided" do
      result = described_class.call(
        tags: [],
        source_path: "/file.txt",
        content: "body text",
        created_at: created_at
      )

      expect(result).to include("tags:")
      expect(result).not_to include("  - ")
    end
  end
end
