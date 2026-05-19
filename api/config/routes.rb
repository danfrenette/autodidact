Rails.application.routes.draw do
  get "csrf-token" => "csrf_tokens#show"
  get "up" => "rails/health#show", :as => :rails_health_check

  post "/rails/active_storage/direct_uploads" => "direct_uploads#create"

  resources :providers, only: :index
  resources :provider_credentials, only: [:index, :create, :update, :destroy]
  resources :provider_role_settings, only: [:index, :create, :destroy]
  resource :provider_availability, only: :show

  resources :sources, only: [:index, :show, :create, :update] do
    scope module: :sources do
      resource :attachment, only: :create
      resources :selections, only: [:create, :destroy]
      resource :process, only: :create
      resource :retry, only: :create
    end
  end

  resources :source_selections, only: [:show]
end
