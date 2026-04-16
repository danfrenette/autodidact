# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_16_033112) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "account", id: :text, force: :cascade do |t|
    t.text "accessToken"
    t.timestamptz "accessTokenExpiresAt"
    t.text "accountId", null: false
    t.timestamptz "createdAt", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.text "idToken"
    t.text "password"
    t.text "providerId", null: false
    t.text "refreshToken"
    t.timestamptz "refreshTokenExpiresAt"
    t.text "scope"
    t.timestamptz "updatedAt", null: false
    t.text "userId", null: false
    t.index ["userId"], name: "account_userId_idx"
  end

  create_table "session", id: :text, force: :cascade do |t|
    t.timestamptz "createdAt", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.timestamptz "expiresAt", null: false
    t.text "ipAddress"
    t.text "token", null: false
    t.timestamptz "updatedAt", null: false
    t.text "userAgent"
    t.text "userId", null: false
    t.index ["userId"], name: "session_userId_idx"
    t.unique_constraint ["token"], name: "session_token_key"
  end

  create_table "user", id: :text, force: :cascade do |t|
    t.timestamptz "createdAt", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.text "email", null: false
    t.boolean "emailVerified", null: false
    t.text "image"
    t.text "name", null: false
    t.timestamptz "updatedAt", default: -> { "CURRENT_TIMESTAMP" }, null: false

    t.unique_constraint ["email"], name: "user_email_key"
  end

  create_table "verification", id: :text, force: :cascade do |t|
    t.timestamptz "createdAt", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.timestamptz "expiresAt", null: false
    t.text "identifier", null: false
    t.timestamptz "updatedAt", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.text "value", null: false
    t.index ["identifier"], name: "verification_identifier_idx"
  end

  add_foreign_key "account", "user", column: "userId", name: "account_userId_fkey", on_delete: :cascade
  add_foreign_key "session", "user", column: "userId", name: "session_userId_fkey", on_delete: :cascade
end
