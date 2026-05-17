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

ActiveRecord::Schema[8.1].define(version: 2026_05_16_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"
  enable_extension "vector"

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.uuid "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "citations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "citable_id", null: false
    t.string "citable_type", null: false
    t.datetime "created_at", null: false
    t.integer "position", null: false
    t.string "role", default: "supporting", null: false
    t.uuid "source_chunk_id", null: false
    t.datetime "updated_at", null: false
    t.index ["citable_type", "citable_id", "position"], name: "index_citations_on_citable_type_and_citable_id_and_position", unique: true
    t.index ["citable_type", "citable_id"], name: "index_citations_on_citable"
    t.index ["source_chunk_id"], name: "index_citations_on_source_chunk_id"
  end

  create_table "concepts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "classification", default: "supporting", null: false
    t.datetime "created_at", null: false
    t.text "definition"
    t.string "name", null: false
    t.uuid "source_selection_id", null: false
    t.datetime "updated_at", null: false
    t.text "why_it_matters"
    t.index ["classification"], name: "index_concepts_on_classification"
    t.index ["source_selection_id", "name"], name: "index_concepts_on_source_selection_id_and_name", unique: true
    t.index ["source_selection_id"], name: "index_concepts_on_source_selection_id"
  end

  create_table "provider_credentials", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "api_key"
    t.datetime "created_at", null: false
    t.string "credential_kind", default: "user_key", null: false
    t.string "key_fingerprint"
    t.text "last_error_message"
    t.datetime "last_verified_at"
    t.string "provider", null: false
    t.string "status", default: "disconnected", null: false
    t.datetime "updated_at", null: false
    t.string "user_id", null: false
    t.index ["status"], name: "index_provider_credentials_on_status"
    t.index ["user_id", "provider"], name: "index_provider_credentials_on_user_id_and_provider", unique: true
  end

  create_table "provider_role_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "model", null: false
    t.uuid "provider_credential_id", null: false
    t.string "role", null: false
    t.datetime "updated_at", null: false
    t.string "user_id", null: false
    t.index ["provider_credential_id"], name: "index_provider_role_settings_on_provider_credential_id"
    t.index ["user_id", "role"], name: "index_provider_role_settings_on_user_id_and_role", unique: true
  end

  create_table "questions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "answer", null: false
    t.datetime "created_at", null: false
    t.integer "position", null: false
    t.uuid "source_selection_id", null: false
    t.text "text", null: false
    t.integer "tier", null: false
    t.string "tier_name", null: false
    t.datetime "updated_at", null: false
    t.index ["source_selection_id", "position"], name: "index_questions_on_source_selection_id_and_position", unique: true
    t.index ["source_selection_id", "tier"], name: "index_questions_on_source_selection_id_and_tier"
    t.index ["source_selection_id"], name: "index_questions_on_source_selection_id"
  end

  create_table "quotes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "note"
    t.integer "position", null: false
    t.uuid "source_selection_id", null: false
    t.text "text", null: false
    t.datetime "updated_at", null: false
    t.index ["source_selection_id", "position"], name: "index_quotes_on_source_selection_id_and_position", unique: true
    t.index ["source_selection_id"], name: "index_quotes_on_source_selection_id"
  end

  create_table "source_chunks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "byte_length", null: false
    t.integer "byte_offset", null: false
    t.string "chunk_id", null: false
    t.integer "chunk_index", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.vector "embedding", limit: 1536
    t.uuid "source_selection_content_id", null: false
    t.integer "token_count", null: false
    t.datetime "updated_at", null: false
    t.index ["chunk_id"], name: "index_source_chunks_on_chunk_id"
    t.index ["source_selection_content_id", "chunk_index"], name: "idx_on_source_selection_content_id_chunk_index_b55b24cd60", unique: true
    t.index ["source_selection_content_id"], name: "index_source_chunks_on_source_selection_content_id"
  end

  create_table "source_selection_contents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "locator_spans", default: [], null: false
    t.text "raw_text", null: false
    t.uuid "source_selection_id", null: false
    t.datetime "updated_at", null: false
    t.index ["source_selection_id"], name: "index_source_selection_contents_on_source_selection_id", unique: true
  end

  create_table "source_selections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "error_details", default: {}, null: false
    t.text "error_message"
    t.string "kind", default: "chapter", null: false
    t.string "label", null: false
    t.jsonb "locator", default: {}, null: false
    t.string "pipeline_stage"
    t.jsonb "position", default: {}, null: false
    t.uuid "source_id", null: false
    t.string "status", default: "pending", null: false
    t.string "subtype"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["kind"], name: "index_source_selections_on_kind"
    t.index ["locator"], name: "index_source_selections_on_locator", using: :gin
    t.index ["position"], name: "index_source_selections_on_position", using: :gin
    t.index ["source_id"], name: "index_source_selections_on_source_id"
    t.index ["status"], name: "index_source_selections_on_status"
  end

  create_table "sources", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "analysis_summary", default: {}, null: false
    t.string "author"
    t.datetime "created_at", null: false
    t.text "error_message"
    t.string "kind", default: "pdf", null: false
    t.string "original_filename"
    t.jsonb "selected_structure_ids", default: [], null: false
    t.string "status", default: "draft", null: false
    t.jsonb "structure", default: {}, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.string "user_id", null: false
    t.index ["kind"], name: "index_sources_on_kind"
    t.index ["selected_structure_ids"], name: "index_sources_on_selected_structure_ids", using: :gin
    t.index ["status"], name: "index_sources_on_status"
    t.index ["structure"], name: "index_sources_on_structure", using: :gin
    t.index ["user_id"], name: "index_sources_on_user_id"
  end

  create_table "taggings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "tag_id", null: false
    t.uuid "taggable_id", null: false
    t.string "taggable_type", null: false
    t.datetime "updated_at", null: false
    t.index ["tag_id", "taggable_id", "taggable_type"], name: "index_taggings_on_tag_id_and_taggable_id_and_taggable_type", unique: true
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
    t.index ["taggable_id", "taggable_type"], name: "index_taggings_on_taggable_id_and_taggable_type"
  end

  create_table "tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.string "user_id", null: false
    t.index ["name"], name: "index_tags_on_name"
    t.index ["user_id", "name"], name: "index_tags_on_user_id_and_name", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "citations", "source_chunks"
  add_foreign_key "concepts", "source_selections"
  add_foreign_key "provider_role_settings", "provider_credentials"
  add_foreign_key "questions", "source_selections"
  add_foreign_key "quotes", "source_selections"
  add_foreign_key "source_chunks", "source_selection_contents"
  add_foreign_key "source_selection_contents", "source_selections"
  add_foreign_key "source_selections", "sources"
  add_foreign_key "taggings", "tags"
end
