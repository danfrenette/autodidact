# frozen_string_literal: true

module Analysis
  ProviderDefinition = Data.define(:id, :display_name, :supported_roles, :models_by_role, :default_models_by_role, :requires_credentials) do
    def supports?(role)
      supported_roles.include?(role)
    end

    def models_for(role)
      models_by_role.fetch(role, [])
    end

    def default_model_for(role)
      default_models_by_role.fetch(role)
    end
  end
end
