Rails.application.routes.draw do
  get "csrf-token" => "csrf_tokens#show"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check

  post "/rails/active_storage/direct_uploads" => "direct_uploads#create"

  resources :sources, only: [:index, :show, :create, :update] do
    resource :attachment, only: :create, controller: "source_attachments"
    resources :selections, only: [:create, :destroy], controller: "source_selections"
    resource :process, only: :create, controller: "source_processes"
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
