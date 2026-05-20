# frozen_string_literal: true

module Sources
  ProcessingFailure = Data.define(:stage, :message, :code, :action, :details) do
    def error_details
      {
        stage: stage,
        message: message,
        code: code,
        action: action
      }.merge(details)
    end
  end
end
