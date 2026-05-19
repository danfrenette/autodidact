# frozen_string_literal: true

require "rails_helper"

RSpec.describe "SourceSelections", type: :request do
  include_context "auth users"

  describe "GET /source_selections/:id" do
    before { sign_in(user: current_user) }

    it "returns the selection analysis payload" do
      source = create(
        :source,
        :processing,
        user: current_user,
        title: "Readable Source",
        author: "A. Writer",
        original_filename: "readable-source.pdf"
      )
      source_tag = create(:tag, user: current_user, name: "architecture")
      selection_tag = create(:tag, user: current_user, name: "design")
      create(:tagging, tag: source_tag, taggable: source)
      selection = create(
        :source_selection,
        :complete,
        source: source,
        title: "Topic 8. The Essence of Good Design",
        label: "22",
        position: {ordinal: 22},
        locator: {type: "page_range", start: 75, end: 78}
      )
      create(:tagging, tag: selection_tag, taggable: selection)
      concept = create(
        :concept,
        source_selection: selection,
        name: "Generated Concept",
        classification: "core",
        definition: "A concrete definition.",
        why_it_matters: "It explains why the idea matters."
      )
      quote = create(
        :quote,
        source_selection: selection,
        text: "A notable source quote.",
        note: "Important because it anchors the idea.",
        position: 0
      )
      question = create(
        :question,
        source_selection: selection,
        tier: 2,
        tier_name: "Comprehension",
        text: "What is the central idea?",
        answer: "Adaptable design.",
        position: 0
      )

      get "/source_selections/#{selection.id}"

      expect(response).to have_http_status(:ok)
      expect(json_response).to eq(
        "data" => {
          "selection" => {
            "id" => selection.id,
            "sourceId" => source.id,
            "kind" => "chapter",
            "subtype" => nil,
            "status" => "complete",
            "pipelineStage" => nil,
            "errorMessage" => nil,
            "errorDetails" => {},
            "title" => "Topic 8. The Essence of Good Design",
            "label" => "22",
            "position" => {"ordinal" => 22},
            "locator" => {"type" => "page_range", "start" => 75, "end" => 78},
            "tags" => ["design"]
          },
          "source" => {
            "id" => source.id,
            "title" => "Readable Source",
            "author" => "A. Writer",
            "kind" => "pdf",
            "originalFilename" => "readable-source.pdf",
            "tags" => ["architecture"],
            "status" => "processing",
            "assetAttached" => false,
            "selectionCount" => 1,
            "completedCount" => 1,
            "failedCount" => 0,
            "progressPercentage" => 100,
            "createdAt" => source.created_at.iso8601,
            "updatedAt" => source.updated_at.iso8601
          },
          "concepts" => [
            {
              "id" => concept.id,
              "name" => "Generated Concept",
              "classification" => "core",
              "definition" => "A concrete definition.",
              "whyItMatters" => "It explains why the idea matters.",
              "createdAt" => concept.created_at.iso8601(3),
              "updatedAt" => concept.updated_at.iso8601(3)
            }
          ],
          "quotes" => [
            {
              "id" => quote.id,
              "text" => "A notable source quote.",
              "note" => "Important because it anchors the idea.",
              "position" => 0,
              "createdAt" => quote.created_at.iso8601(3),
              "updatedAt" => quote.updated_at.iso8601(3)
            }
          ],
          "questions" => [
            {
              "id" => question.id,
              "tier" => 2,
              "tierName" => "Comprehension",
              "text" => "What is the central idea?",
              "answer" => "Adaptable design.",
              "position" => 0,
              "createdAt" => question.created_at.iso8601(3),
              "updatedAt" => question.updated_at.iso8601(3)
            }
          ]
        },
        "error" => nil,
        "meta" => {}
      )
    end

    it "returns empty artifact arrays for an unanalyzed selection" do
      source = create(:source, user: current_user)
      selection = create(:source_selection, source: source)

      get "/source_selections/#{selection.id}"

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "concepts")).to eq([])
      expect(json_response.dig("data", "quotes")).to eq([])
      expect(json_response.dig("data", "questions")).to eq([])
    end

    it "orders concepts by creation time and quotes and questions by position" do
      source = create(:source, user: current_user)
      selection = create(:source_selection, source: source)
      first_concept = create(:concept, source_selection: selection, name: "First Concept", created_at: 2.days.ago)
      second_concept = create(:concept, source_selection: selection, name: "Second Concept", created_at: 1.day.ago)
      second_quote = create(:quote, source_selection: selection, text: "Second quote", position: 1)
      first_quote = create(:quote, source_selection: selection, text: "First quote", position: 0)
      second_question = create(:question, source_selection: selection, text: "Second question", position: 1)
      first_question = create(:question, source_selection: selection, text: "First question", position: 0)

      get "/source_selections/#{selection.id}"

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "concepts").pluck("id")).to eq([first_concept.id, second_concept.id])
      expect(json_response.dig("data", "quotes").pluck("id")).to eq([first_quote.id, second_quote.id])
      expect(json_response.dig("data", "questions").pluck("id")).to eq([first_question.id, second_question.id])
    end

    it "does not handle ownership in the controller" do
      other_source = create(:source, user: other_user)
      other_selection = create(:source_selection, source: other_source)

      get "/source_selections/#{other_selection.id}"

      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for an unknown selection" do
      get "/source_selections/#{SecureRandom.uuid}"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /sources/:source_id/selections" do
    let_it_be(:source, refind: true) { create(:source, user: current_user) }

    before { sign_in(user: current_user) }

    it "creates a new selection for the source" do
      selection_params = {
        source_selection: {
          kind: "chapter",
          title: "New Chapter",
          label: "05",
          position: {ordinal: 5},
          locator: {type: "page_range", start: 100, end: 120}
        }
      }

      expect {
        post source_selections_path(source), params: selection_params, as: :json
      }.to change(SourceSelection, :count).by(1)

      expect(response).to have_http_status(:created)

      expect(json_response.dig("data", "sourceSelection", "title")).to eq("New Chapter")
      expect(json_response.dig("data", "sourceSelection", "label")).to eq("05")
      expect(json_response.fetch("error")).to be_nil
    end

    it "returns validation errors when selection params are invalid" do
      selection_params = {
        source_selection: {
          kind: "chapter",
          title: "",
          label: "05"
        }
      }

      expect {
        post source_selections_path(source), params: selection_params, as: :json
      }.not_to change(SourceSelection, :count)

      expect(response).to have_http_status(:unprocessable_content)

      expect(json_response.fetch("error")).to include("code" => "validation_failed")
    end

    it "does not handle ownership in the controller" do
      other_source = create(:source, user: other_user)

      selection_params = {
        source_selection: {
          kind: "chapter",
          title: "New Chapter",
          label: "05",
          position: {ordinal: 5},
          locator: {type: "page_range", start: 100, end: 120}
        }
      }

      post source_selections_path(other_source), params: selection_params, as: :json

      expect(response).to have_http_status(:created)
    end
  end

  describe "DELETE /sources/:source_id/selections/:id" do
    let_it_be(:source, refind: true) { create(:source, user: current_user) }

    before { sign_in(user: current_user) }

    it "deletes a pending selection" do
      selection = create(:source_selection, :pending, source: source, title: "To Delete")

      expect {
        delete "/sources/#{source.id}/selections/#{selection.id}", as: :json
      }.to change(SourceSelection, :count).by(-1)

      expect(response).to have_http_status(:ok)

      expect(json_response.dig("data", "sourceSelection", "title")).to eq("To Delete")
      expect(json_response.fetch("error")).to be_nil
    end

    it "returns conflict when trying to delete a non-pending selection" do
      selection = create(:source_selection, :complete, source: source)

      expect {
        delete "/sources/#{source.id}/selections/#{selection.id}", as: :json
      }.not_to change(SourceSelection, :count)

      expect(response).to have_http_status(:conflict)

      expect(json_response.fetch("error")).to include("code" => "conflict")
      expect(json_response.dig("error", "message")).to include("Only pending selections can be deleted")
    end

    it "does not handle ownership in the controller" do
      other_source = create(:source, user: other_user)
      other_selection = create(:source_selection, :pending, source: other_source)

      delete "/sources/#{other_source.id}/selections/#{other_selection.id}", as: :json

      expect(response).to have_http_status(:ok)
    end
  end
end
