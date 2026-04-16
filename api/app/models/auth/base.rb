module Auth
  class Base < ApplicationRecord
    self.abstract_class = true

    def readonly?
      true
    end
  end
end
