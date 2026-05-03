# frozen_string_literal: true

class SourceSelection::Locator
  attr_reader :kind, :start_page, :end_page

  def self.load(value)
    case value
    when self
      value
    when Hash
      attributes = value.with_indifferent_access
      new(
        kind: attributes[:type],
        start_page: attributes[:start],
        end_page: attributes[:end]
      )
    when nil
      new
    else
      raise ArgumentError, "Unsupported locator value: #{value.inspect}"
    end
  end

  def self.dump(value)
    load(value).as_json
  end

  def initialize(kind: nil, start_page: nil, end_page: nil)
    @kind = kind
    @start_page = start_page
    @end_page = end_page
  end

  def as_json(*)
    {
      type: kind,
      start: start_page,
      end: end_page
    }
  end
end
