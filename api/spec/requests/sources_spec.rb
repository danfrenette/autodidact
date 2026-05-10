# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sources", type: :request do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:other_user, refind: true) { create(:user, id: "user_456") }

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
        tags: ["Programming", "Software Craft"],
        selections: [
          {
            kind: "chapter",
            title: "&#160;Foreword",
            label: "01",
            position: {ordinal: 1},
            locator: {type: "page_range", start: 13, end: 13}
          },
          {
            kind: "chapter",
            title: "&#160;Preface to the Second Edition",
            label: "02",
            position: {ordinal: 2},
            locator: {type: "page_range", start: 17, end: 17}
          }
        ]
      }

      expect {
        post sources_path, params: {source: source_params}, as: :json
      }.to change(Source, :count).by(1)
        .and change(SourceSelection, :count).by(2)
        .and change(Tag, :count).by(2)
        .and change(Tagging, :count).by(2)

      expect(response).to have_http_status(:created)

      expect(json_response.dig("data", "source", "assetAttached")).to be false
      expect(json_response.dig("data", "source", "title")).to eq(source_params.fetch(:title))
      expect(json_response.dig("data", "source", "kind")).to eq("pdf")
      expect(json_response.dig("data", "source", "author")).to eq("Andrew Hunt & David Thomas")
      expect(json_response.dig("data", "source", "tags")).to eq(["programming", "software-craft"])
      expect(json_response.fetch("error")).to be_nil

      source = Source.find(json_response.dig("data", "source", "id"))
      expect(source).to have_attributes(
        title: source_params.fetch(:title),
        kind: "pdf",
        author: "Andrew Hunt & David Thomas",
        user_id: current_user.id
      )
    end

    it "returns validation errors when source params are invalid" do
      source_params = {
        title: "",
        kind: "pdf",
        author: "Test Author"
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
    let_it_be(:source, refind: true) do
      create(:source, user: current_user, title: "Test Source", author: "Test Author")
    end

    before { sign_in(user: current_user) }

    it "returns the source with its selections" do
      create(:source_selection, :complete, source: source, title: "Chapter 1", label: "01")
      create(:source_selection, :pending, source: source, title: "Chapter 2", label: "02")

      get source_path(source)

      expect(response).to have_http_status(:ok)

      expect(json_response.dig("data", "title")).to eq("Test Source")
      expect(json_response.dig("data", "author")).to eq("Test Author")
      expect(json_response.dig("data", "progressPercentage")).to eq(50)
      expect(json_response.dig("data", "selections").length).to eq(2)
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
