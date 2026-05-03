# frozen_string_literal: true

FactoryBot.define do
  factory :user, class: "Auth::User" do
    sequence(:id) { |n| "user_#{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    name { "Test User" }
    emailVerified { false }
    image { nil }
    createdAt { Time.current }
    updatedAt { Time.current }

    to_create do |user, evaluator|
      attrs = evaluator.attributes.symbolize_keys
      ActiveRecord::Base.connection.execute(<<~SQL.squish)
        INSERT INTO auth.user (id, email, name, "emailVerified", image, "createdAt", "updatedAt")
        VALUES (
          #{ActiveRecord::Base.connection.quote(attrs[:id])},
          #{ActiveRecord::Base.connection.quote(attrs[:email])},
          #{ActiveRecord::Base.connection.quote(attrs[:name])},
          #{ActiveRecord::Base.connection.quote(attrs[:emailVerified])},
          #{ActiveRecord::Base.connection.quote(attrs[:image])},
          #{ActiveRecord::Base.connection.quote(attrs[:createdAt])},
          #{ActiveRecord::Base.connection.quote(attrs[:updatedAt])}
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          "updatedAt" = EXCLUDED."updatedAt"
        RETURNING *
      SQL
      user.id = attrs[:id]
      user.reload
    end
  end
end
