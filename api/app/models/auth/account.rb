module Auth
  class Account < Base
    self.table_name = "auth.account"

    belongs_to :user, class_name: "Auth::User", foreign_key: "userId"
  end
end
