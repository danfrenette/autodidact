# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::AnalyzeContent, type: :service do
  describe ".call" do
    it "returns analysis from the configured generation client" do
      chunk = create(:source_chunk)
      analysis = {concepts: [], questions: [], quotes: []}
      client = double(analyze: analysis)

      result = described_class.call(source_chunks: [chunk], related_chunks: [], client: client)

      expect(result).to be_success
      expect(result.analysis).to eq(analysis)
      expect(client).to have_received(:analyze).with(source_chunks: [chunk], related_chunks: [])
    end

    it "marks blocking provider credentials as errored" do
      user = create(:user)
      credential = create(:provider_credential, user: user, provider: "google")
      chunk = create(:source_chunk)
      error = Analysis::ProviderError.new(
        "Google quota exceeded.",
        code: :quota_exceeded,
        provider: :google,
        retry_after: 52.0
      )
      client = double
      allow(client).to receive(:analyze).and_raise(error)

      result = described_class.call(source_chunks: [chunk], related_chunks: [], user: user, client: client)

      expect(result).to be_failure
      expect(result.error_details).to include(code: "quota_exceeded", provider: "google", retry_after: 52.0)
      expect(credential.reload).to be_error
      expect(credential.last_error_message).to eq("Google quota exceeded.")
    end
  end
end
