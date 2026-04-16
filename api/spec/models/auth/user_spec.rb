require "rails_helper"

RSpec.describe Auth::User, type: :model do
  describe "read-only behavior" do
    it "is marked as readonly" do
      user = Auth::User.new

      expect(user.readonly?).to be true
    end

    it "cannot be created through Rails" do
      expect {
        Auth::User.create!(email: "test@example.com", name: "Test")
      }.to raise_error(ActiveRecord::ReadOnlyRecord)
    end
  end

  describe "associations" do
    it { should have_many(:accounts).class_name("Auth::Account").with_foreign_key("userId") }
    it { should have_many(:sessions).class_name("Auth::Session").with_foreign_key("userId") }
  end
end
