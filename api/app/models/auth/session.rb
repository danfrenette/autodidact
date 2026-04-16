module Auth
  class Session < Base
    self.table_name = "auth.session"

    belongs_to :user, class_name: "Auth::User", foreign_key: "userId"
  end
end
