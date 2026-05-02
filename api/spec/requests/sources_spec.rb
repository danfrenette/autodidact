# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sources", type: :request do
  describe "POST /sources" do
    it "creates a source with selected chapters from the intake payload" do
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
end
