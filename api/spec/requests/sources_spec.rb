# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sources", type: :request do
  include ActiveJob::TestHelper

  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:other_user, refind: true) { create(:user, id: "user_456") }
  let(:pdf_fixture_path) { "/Users/dan/code/substrate/spec/fixtures/with_toc.pdf" }
  let(:pdf_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: File.open(pdf_fixture_path),
      filename: "with_toc.pdf",
      content_type: "application/pdf"
    )
  end

  describe "GET /sources" do
    include_context "source library"
    before { sign_in(user: current_user) }

    it "returns the current user's sources in reverse update order" do
      get sources_path

      expect(response).to have_http_status(:ok)

      sources = json_response.dig("data", "sources")

      expect(sources.pluck("title")).to eq([
        newer_source.title,
        older_source.title
      ])
      expect(sources.second.fetch("selectionCount")).to eq(2)
      expect(sources.second.fetch("completedCount")).to eq(1)
      expect(sources.second.fetch("progressPercentage")).to eq(50)
      expect(sources.first.fetch("progressPercentage")).to eq(100)
      expect(json_response.fetch("error")).to be_nil
    end

    it "does not include other users' sources" do
      get sources_path

      sources = json_response.dig("data", "sources")

      expect(sources.map { |s| s["title"] }).not_to include("Other User Source")
    end
  end

  describe "POST /sources" do
    before { sign_in(user: current_user) }

    it "creates a source with selected chapters from the intake payload" do
      source_params = {
        title: "The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas",
        kind: "pdf",
        author: "Andrew Hunt & David Thomas",
        original_filename: "The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas.pdf",
        signed_blob_id: pdf_blob.signed_id,
        tags: ["distributed-systems", "concurrency", "new-global-tag"],
        selections: [
          {
            kind: "chapter",
            title: "Introduction",
            label: "01",
            position: {ordinal: 1},
            locator: {type: "page_range", start: 1, end: 1},
            tags: []
          },
          {
            kind: "chapter",
            title: "Chapter 1—Methods",
            label: "02",
            position: {ordinal: 2},
            locator: {type: "page_range", start: 2, end: 1},
            tags: ["chapter-tag"]
          },
          {
            kind: "chapter",
            title: "Chapter 2",
            label: "03",
            position: {ordinal: 3},
            locator: {type: "page_range", start: 2, end: 2},
            tags: []
          }
        ]
      }

      expect {
        post sources_path, params: {source: source_params}, as: :json
      }.to change(Source, :count).by(1)
        .and change(SourceSelection, :count).by(3)
        .and change(Tag, :count).by(4)
        .and change(Tagging, :count).by(4)

      expect(response).to have_http_status(:created)

      expect(json_response.dig("data", "source", "assetAttached")).to be true
      expect(json_response.dig("data", "source", "status")).to eq("processing")
      expect(json_response.dig("data", "source", "title")).to eq(source_params.fetch(:title))
      expect(json_response.dig("data", "source", "kind")).to eq("pdf")
      expect(json_response.dig("data", "source", "author")).to eq("Andrew Hunt & David Thomas")
      expect(json_response.dig("data", "source", "tags")).to eq(["concurrency", "distributed-systems", "new-global-tag"])
      expect(json_response.fetch("error")).to be_nil

      source = Source.find(json_response.dig("data", "source", "id"))
      expect(source).to have_attributes(
        title: source_params.fetch(:title),
        kind: "pdf",
        author: "Andrew Hunt & David Thomas",
        user_id: current_user.id
      )
      first_selection = source.source_selections.find_by!(label: "01")
      second_selection = source.source_selections.find_by!(label: "02")
      third_selection = source.source_selections.find_by!(label: "03")

      expect(first_selection.tags).to be_empty
      expect(second_selection.tags.map(&:name)).to eq(["chapter-tag"])
      expect(third_selection.tags).to be_empty
    end

    it "attaches the uploaded PDF and analyzes selected chapters" do
      source_params = {
        title: "PDF Processing Fixture",
        kind: "pdf",
        author: "Test Author",
        original_filename: "with_toc.pdf",
        signed_blob_id: pdf_blob.signed_id,
        tags: ["processing"],
        selections: [
          {
            kind: "chapter",
            title: "Introduction",
            label: "01",
            position: {ordinal: 1},
            locator: {type: "page_range", start: 1, end: 1},
            tags: []
          }
        ]
      }

      expect {
        perform_enqueued_jobs do
          post sources_path, params: {source: source_params}, as: :json
        end
      }.to change(Source, :count).by(1)
        .and change(SourceSelectionContent, :count).by(1)
        .and change(SourceChunk, :count).by_at_least(1)
        .and change(Concept, :count).by(1)
        .and change(Question, :count).by(1)
        .and change(Quote, :count).by(1)

      expect(response).to have_http_status(:created)

      source = Source.find(json_response.dig("data", "source", "id"))
      selection = source.source_selections.sole

      expect(source.asset).to be_attached
      expect(source).to be_complete
      expect(selection).to be_complete
      expect(selection.source_selection_content.raw_text).to be_present
      expect(selection.concepts.sole.citations).to be_present
      expect(selection.questions.sole.citations).to be_present
      expect(selection.quotes.sole.citations).to be_present
    end

    it "returns validation errors when source params are invalid" do
      source_params = {
        title: "",
        kind: "pdf",
        author: "Test Author",
        signed_blob_id: pdf_blob.signed_id
      }

      expect {
        post sources_path, params: {source: source_params}, as: :json
      }.not_to change(Source, :count)

      expect(response).to have_http_status(:unprocessable_content)

      expect(json_response.fetch("error")).to include("code" => "validation_failed")
      expect(json_response.dig("error", "details", "errors")).to include(/Title/)
    end
  end

  describe "GET /sources/:id" do
    let(:source_params) do
      {
        title: "Test Source",
        kind: "pdf",
        author: "Test Author",
        signed_blob_id: pdf_blob.signed_id,
        selections: [
          {
            kind: "chapter",
            title: "Introduction",
            label: "01",
            position: {ordinal: 1},
            locator: {type: "page_range", start: 1, end: 1},
            tags: ["process"]
          },
          {
            kind: "chapter",
            title: "Chapter 2",
            label: "02",
            position: {ordinal: 2},
            locator: {type: "page_range", start: 2, end: 2},
            tags: []
          }
        ]
      }
    end

    before { sign_in(user: current_user) }

    it "returns the source with its selections" do
      post sources_path, params: {source: source_params}, as: :json

      source = Source.find(json_response.dig("data", "source", "id"))

      get source_path(source)

      expect(response).to have_http_status(:ok)

      expect(json_response.dig("data", "title")).to eq("Test Source")
      expect(json_response.dig("data", "author")).to eq("Test Author")
      expect(json_response.dig("data", "progressPercentage")).to eq(0)
      expect(json_response.dig("data", "selections").length).to eq(2)
      first_selection = json_response.dig("data", "selections").find { |selection| selection.fetch("label") == "01" }

      expect(first_selection.fetch("tags")).to eq(["process"])
      expect(json_response.fetch("error")).to be_nil
    end

    it "returns a completed processed source with UI-visible selections" do
      source = create(:source, :complete, user: current_user, title: "Processed Source")
      selection = create(:source_selection, :complete, source: source, title: "Chapter 1", label: "01")
      create(:concept, source_selection: selection, name: "Visible Concept")

      get source_path(source)

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(source.id)
      expect(json_response.dig("data", "status")).to eq("complete")
      expect(json_response.dig("data", "selectionCount")).to eq(1)
      expect(json_response.dig("data", "completedCount")).to eq(1)
      expect(json_response.dig("data", "progressPercentage")).to eq(100)
      expect(json_response.dig("data", "selections")).to contain_exactly(
        include(
          "id" => selection.id,
          "title" => "Chapter 1",
          "label" => "01",
          "status" => "complete"
        )
      )
      expect(json_response.fetch("error")).to be_nil
    end

    it "returns 404 for a source belonging to another user" do
      other_source = create(:source, user: other_user)

      get source_path(other_source)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /sources/:id" do
    let_it_be(:source, refind: true) do
      create(:source, user: current_user, title: "Original Title")
    end

    before { sign_in(user: current_user) }

    it "updates the source title" do
      patch source_path(source), params: {source: {title: "Updated Title"}}, as: :json

      expect(response).to have_http_status(:ok)

      expect(json_response.dig("data", "source", "title")).to eq("Updated Title")
      expect(json_response.fetch("error")).to be_nil

      expect(source.reload.title).to eq("Updated Title")
    end

    it "returns validation errors when update params are invalid" do
      patch source_path(source), params: {source: {title: ""}}, as: :json

      expect(response).to have_http_status(:unprocessable_content)

      expect(json_response.fetch("error")).to include("code" => "validation_failed")
      expect(json_response.dig("error", "details", "errors")).to include(/Title/)
    end

    it "returns 404 for a source belonging to another user" do
      other_source = create(:source, user: other_user)

      patch source_path(other_source), params: {source: {title: "Updated Title"}}, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
