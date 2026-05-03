# frozen_string_literal: true

class SourceSelection::Position
  attr_reader :ordinal

  def self.load(value)
    case value
    when self
      value
    when Hash
      new(ordinal: value.with_indifferent_access[:ordinal])
    when nil
      new
    else
      new(ordinal: value)
    end
  end

  def self.dump(value)
    load(value).as_json
  end

  def initialize(ordinal: nil)
    @ordinal = ordinal
  end

  def as_json(*)
    {ordinal: ordinal}
  end
end
