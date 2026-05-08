# frozen_string_literal: true

RSpec.shared_context "auth users", auth_users: true do
  before(:all) do
    TestProf::AnyFixture.register(:auth_users) do
      create(:user, id: "user_123", email: "primary@example.com", name: "Primary User")
      create(:user, id: "user_456", email: "other@example.com", name: "Other User")
    end
  end

  let(:current_user) { Auth::User.find("user_123") }
  let(:other_user) { Auth::User.find("user_456") }
end

RSpec.shared_context "source library", source_library: true do
  include_context "auth users"

  before(:all) do
    TestProf::AnyFixture.register(:source_library) do
      primary_user = Auth::User.find("user_123")
      other_user = Auth::User.find("user_456")

      older_source = create(
        :source,
        user: primary_user,
        title: "The Pragmatic Programmer",
        original_filename: "pragmatic-programmer.pdf",
        updated_at: 2.days.ago
      )
      newer_source = create(
        :source,
        user: primary_user,
        title: "Designing Data-Intensive Applications",
        original_filename: "ddia.pdf",
        updated_at: 1.day.ago
      )
      other_source = create(:source, user: other_user, title: "Other User Source")

      create(:source_selection, source: older_source, status: "complete")
      create(:source_selection, source: older_source, status: "pending")
      create(:source_selection, source: newer_source, status: "complete")
      create(:source_selection, source: other_source, status: "pending")
    end
  end

  let(:older_source) { Source.find_by!(title: "The Pragmatic Programmer", user_id: current_user.id) }
  let(:newer_source) { Source.find_by!(title: "Designing Data-Intensive Applications", user_id: current_user.id) }
  let(:other_source) { Source.find_by!(title: "Other User Source", user_id: other_user.id) }
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
