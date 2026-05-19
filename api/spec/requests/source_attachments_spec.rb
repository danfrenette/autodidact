# frozen_string_literal: true

require "rails_helper"

RSpec.describe "SourceAttachments", type: :request do
  include_context "auth users"

  describe "POST /sources/:source_id/attachment" do
    let_it_be(:source, refind: true) { create(:source, user: current_user, status: "uploading") }

    before { sign_in(user: current_user) }

    it "attaches a file to the source" do
      blob = ActiveStorage::Blob.create_and_upload!(
        io: StringIO.new("fake pdf content"),
        filename: "test.pdf",
        content_type: "application/pdf"
      )

      post source_attachment_path(source), params: {signed_blob_id: blob.signed_id}, as: :json

      expect(response).to have_http_status(:created)

      expect(json_response.dig("data", "source", "assetAttached")).to be true
      expect(json_response.dig("data", "source", "status")).to eq("uploaded")
      expect(json_response.fetch("error")).to be_nil

      expect(source.reload.asset).to be_attached
      expect(source.status).to eq("uploaded")
      expect(source.original_filename).to eq("test.pdf")
    end

    it "returns server error when signed_blob_id is invalid" do
      # The service doesn't currently handle invalid blob IDs gracefully
      invalid_signed_id = "invalid_blob_id--mismatched_signature"

      expect {
        post source_attachment_path(source), params: {signed_blob_id: invalid_signed_id}, as: :json
      }.to raise_error(ActiveSupport::MessageVerifier::InvalidSignature)
    end

    it "does not handle ownership in the controller" do
      other_source = create(:source, user: other_user, status: "uploading")

      blob = ActiveStorage::Blob.create_and_upload!(
        io: StringIO.new("fake pdf content"),
        filename: "test.pdf",
        content_type: "application/pdf"
      )

      post source_attachment_path(other_source), params: {signed_blob_id: blob.signed_id}, as: :json

      expect(response).to have_http_status(:created)
    end
  end
end
