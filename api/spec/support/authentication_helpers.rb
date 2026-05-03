# frozen_string_literal: true

module AuthenticationHelpers
  def sign_in(user: instance_double(Auth::User, id: "user_123"))
    resolver = instance_double(Auth::CurrentUserResolver, call: user)

    allow(Auth::CurrentUserResolver).to receive(:new).and_return(resolver)

    user
  end
end
