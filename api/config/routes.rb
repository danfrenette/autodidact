Rails.application.routes.draw do
  get "csrf-token" => "csrf_tokens#show"
  get "up" => "rails/health#show", :as => :rails_health_check

  post "/rails/active_storage/direct_uploads" => "direct_uploads#create"

  resources :providers, only: :index
  resources :provider_credentials, only: [:index, :create, :update, :destroy]
  resources :provider_role_settings, only: [:index, :create, :destroy]
  resource :provider_availability, only: :show

  resources :sources, only: [:index, :show, :create, :update] do
    resource :attachment, only: :create, controller: "source_attachments"
    resources :selections, only: [:create, :destroy], controller: "source_selections"
    resource :process, only: :create, controller: "source_processes"
  end

  resources :source_selections, only: [:show]
end
