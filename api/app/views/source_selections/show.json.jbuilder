json.data do
  json.selection do
    json.partial! "shared/source_selection", source_selection: source_selection
  end

  json.source do
    json.partial! "shared/source", source: source_selection.source
  end

  json.concepts source_selection.concepts.order(:created_at) do |concept|
    json.partial! "concepts/concept", concept: concept
  end

  json.quotes source_selection.quotes.order(:position) do |quote|
    json.partial! "quotes/quote", quote: quote
  end

  json.questions source_selection.questions.order(:position) do |question|
    json.partial! "questions/question", question: question
  end
end

json.error nil
json.meta({})
