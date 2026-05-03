require "rails_helper"

RSpec.describe Auth::Verification, type: :model do
  describe "read-only behavior" do
    it "is marked as readonly" do
      verification = Auth::Verification.new

      expect(verification.readonly?).to be true
    end

    it "cannot be created through Rails" do
      expect {
        Auth::Verification.create!(identifier: "test", value: "123456")
      }.to raise_error(ActiveRecord::ReadOnlyRecord)
    end
  end
end
