# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sources", type: :request do
  describe "GET /sources" do
    it "returns the current user's sources in reverse update order" do
      user = create(:user, id: "user_123")
      other_user = create(:user, id: "user_456")
      sign_in(user: user)

      older_source = create(
        :source,
        user: user,
        title: "The Pragmatic Programmer",
        original_filename: "pragmatic-programmer.pdf",
        updated_at: 2.days.ago
      )
      newer_source = create(
        :source,
        user: user,
        title: "Designing Data-Intensive Applications",
        original_filename: "ddia.pdf",
        updated_at: 1.day.ago
      )
      other_source = create(:source, user: other_user, title: "Other User Source")
      create(:source_selection, source: older_source, status: "complete")
      create(:source_selection, source: older_source, status: "pending")
      create(:source_selection, source: newer_source, status: "complete")
      create(:source_selection, source: other_source, status: "pending")

      get sources_path

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      sources = json.dig("data", "sources")

      expect(sources.pluck("title")).to eq([
        newer_source.title,
        older_source.title
      ])
      expect(sources.second.fetch("selectionCount")).to eq(2)
      expect(sources.second.fetch("completedCount")).to eq(1)
      expect(sources.second.fetch("progressPercentage")).to eq(50)
      expect(sources.first.fetch("progressPercentage")).to eq(100)
      expect(json.fetch("error")).to be_nil
    end
  end

  describe "POST /sources" do
    it "creates a source with selected chapters from the intake payload" do
      create(:user, id: "user_123")
      sign_in

      source_params = {
        title: "The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas",
        kind: "pdf",
        original_filename: "The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas.pdf",
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
          },
          {
            kind: "chapter",
            title: "How the Book Is Organized",
            label: "03",
            position: {ordinal: 3},
            locator: {type: "page_range", start: 20, end: 20}
          },
          {
            kind: "chapter",
            title: "Topic 48. The Essence of Agility",
            label: "68",
            position: {ordinal: 68},
            locator: {type: "page_range", start: 429, end: 429}
          }
        ]
      }

      expect {
        post sources_path, params: {source: source_params}, as: :json
      }.to change(Source, :count).by(1).and change(SourceSelection, :count).by(4)

      expect(response).to have_http_status(:created)

      source = Source.last
      selections = source.source_selections.order(:created_at)

      expect(source).to have_attributes(
        title: source_params.fetch(:title),
        kind: "pdf",
        original_filename: source_params.fetch(:original_filename),
        user_id: "user_123"
      )
      expect(selections.pluck(:title)).to eq([
        "&#160;Foreword",
        "&#160;Preface to the Second Edition",
        "How the Book Is Organized",
        "Topic 48. The Essence of Agility"
      ])
      expect(selections.last.locator).to eq({"type" => "page_range", "start" => 429, "end" => 429})

      json = JSON.parse(response.body)
      expect(json.dig("data", "source", "assetAttached")).to be false
      expect(json.fetch("error")).to be_nil
      expect(json.fetch("meta")).to eq({})
    end
  end

  describe "GET /sources/:id" do
    it "returns the source with its selections" do
      user = create(:user, id: "user_123")
      sign_in(user: user)

      source = create(
        :source,
        user: user,
        title: "Designing Data-Intensive Applications",
        kind: "pdf"
      )
      complete_selection = create(
        :source_selection,
        source: source,
        title: "Reliable, Scalable, and Maintainable Applications",
        label: "01",
        position: 1,
        status: "complete"
      )
      pending_selection = create(
        :source_selection,
        source: source,
        title: "Data Models and Query Languages",
        label: "02",
        position: 2,
        status: "pending"
      )

      get source_path(source)

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json.dig("data", "title")).to eq("Designing Data-Intensive Applications")
      expect(json.dig("data", "progressPercentage")).to eq(50)

      selections = json.dig("data", "selections")
      expect(selections.length).to eq(2)
      expect(selections.first.fetch("title")).to eq("Reliable, Scalable, and Maintainable Applications")
      expect(selections.first.fetch("label")).to eq("01")
      expect(selections.first.fetch("status")).to eq("complete")
      expect(selections.second.fetch("status")).to eq("pending")

      expect(json.fetch("error")).to be_nil
    end

    it "returns 404 for a source belonging to another user" do
      user = create(:user, id: "user_123")
      other_user = create(:user, id: "user_456")
      sign_in(user: user)

      other_source = create(:source, user: other_user)

      get source_path(other_source)

      expect(response).to have_http_status(:not_found)
    end
  end
end
