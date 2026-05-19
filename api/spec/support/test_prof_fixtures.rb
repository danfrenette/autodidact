# frozen_string_literal: true

RSpec.shared_context "current user", current_user: true do
  before(:all) do
    TestProf::AnyFixture.register(:current_user) do
      create(:user, id: "user_123", email: "primary@example.com", name: "Primary User")
    end
  end

  let_it_be(:current_user, refind: true) do
    Auth::User.find("user_123")
  end
end

RSpec.shared_context "other user", other_user: true do
  let_it_be(:other_user, refind: true) do
    create(:user, id: "user_456", email: "other@example.com", name: "Other User")
  end
end

RSpec.shared_context "auth users", auth_users: true do
  include_context "current user"
  include_context "other user"
end

RSpec.shared_context "pdf blob", pdf_blob: true do
  let(:pdf_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: File.open("/Users/dan/code/substrate/spec/fixtures/with_toc.pdf"),
      filename: "with_toc.pdf",
      content_type: "application/pdf"
    )
  end
end

RSpec.shared_context "mock provider settings", mock_provider_settings: true do
  include_context "current user"

  before(:all) do
    TestProf::AnyFixture.register(:mock_provider_settings) do
      user = Auth::User.find("user_123")
      credential = create(:provider_credential, :mock, user: user)
      create(:provider_role_setting, user: user, provider_credential: credential, role: :embedding, model: "mock-embedding")
      create(:provider_role_setting, user: user, provider_credential: credential, role: :generation, model: "mock-generation")
      credential
    end
  end

  let_it_be(:mock_provider_credential, refind: true) do
    current_user.provider_credentials.find_by!(provider: "mock")
  end
end

RSpec.shared_context "source library", source_library: true do
  include_context "auth users"

  let_it_be(:source_library_records, refind: true) do
    TestProf::AnyFixture.register(:source_library) do
      older_source = create(:source, user: current_user, title: "The Pragmatic Programmer", original_filename: "pragmatic-programmer.pdf", updated_at: 2.days.ago)
      newer_source = create(:source, user: current_user, title: "Designing Data-Intensive Applications", original_filename: "ddia.pdf", updated_at: 1.day.ago)
      other_source = create(:source, user: other_user, title: "Other User Source")

      create(:source_selection, source: older_source, status: "complete")
      create(:source_selection, source: older_source, status: "pending")
      create(:source_selection, source: newer_source, status: "complete")
      create(:source_selection, source: other_source, status: "pending")

      [older_source, newer_source, other_source]
    end
  end

  let(:older_source) { source_library_records.first }
  let(:newer_source) { source_library_records.second }
  let(:other_source) { source_library_records.third }
end

RSpec.shared_context "concept library", concept_library: true do
  include_context "auth users"

  before(:all) do
    TestProf::AnyFixture.register(:concept_library) do
      source = create(:source, user: Auth::User.find("user_123"), title: "Transactions Source")
      selection = create(:source_selection, source: source, title: "Chapter 7: Transactions")
      create(:concept, :core, source_selection: selection)
      create(:concept, :supporting, source_selection: selection)
      create(:concept, :advanced, source_selection: selection)
    end
  end

  let(:source) { Source.find_by!(title: "Transactions Source", user_id: current_user.id) }
  let(:selection) { source.source_selections.find_by!(title: "Chapter 7: Transactions") }
end
