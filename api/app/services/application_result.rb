# frozen_string_literal: true

class ApplicationResult < Data.define(:success, :errors)
  def self.define(*members)
    Class.new(self) do
      attr_reader(*members)

      define_method(:initialize) do |success:, errors: [], **attributes|
        members.each do |member|
          instance_variable_set("@#{member}", attributes.fetch(member))
        end

        super(success: success, errors: errors)
      end
    end
  end

  def initialize(success:, errors: [])
    super
  end

  def success?
    success
  end

  def failure?
    !success?
  end
end
