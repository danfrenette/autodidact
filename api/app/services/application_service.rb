# frozen_string_literal: true

class ApplicationService
  def self.call(...)
    new(...).call
  end

  private

  def success(**attributes)
    result_class.new(success: true, **attributes)
  end

  def failure(**attributes)
    result_class.new(success: false, **attributes)
  end

  def result_class
    self.class.const_defined?(:Result, false) ? self.class::Result : ApplicationResult
  end
end
