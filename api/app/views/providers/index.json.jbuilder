json.data do
  json.providers providers do |provider|
    json.id provider.id
    json.displayName provider.display_name
    json.supportedRoles provider.supported_roles
    json.requiresCredentials provider.requires_credentials
    json.modelsByRole provider.models_by_role
    json.defaultModelsByRole provider.default_models_by_role
  end
end

json.error nil
json.meta({})
