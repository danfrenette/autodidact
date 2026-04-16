require "rails_helper"

RSpec.describe Auth::Account, type: :model do
  describe "read-only behavior" do
    it "is marked as readonly" do
      account = Auth::Account.new

      expect(account.readonly?).to be true
    end

    it "cannot be created through Rails" do
      account = Auth::Account.new(providerId: "credentials", accountId: "test", userId: "fake-user-id")

      expect { account.save!(validate: false) }.to raise_error(ActiveRecord::ReadOnlyRecord)
    end
  end

  describe "associations" do
    it { should belong_to(:user).class_name("Auth::User").with_foreign_key("userId") }
  end
end
