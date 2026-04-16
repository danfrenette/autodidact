module Auth
  class User < Base
    self.table_name = "auth.user"

    has_many :accounts, class_name: "Auth::Account", foreign_key: "userId"
    has_many :sessions, class_name: "Auth::Session", foreign_key: "userId"
  end
end
