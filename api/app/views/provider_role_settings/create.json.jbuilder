json.data do
  json.roleSetting do
    json.partial! "provider_role_settings/provider_role_setting", provider_role_setting: role_setting
  end
end

json.error nil
json.meta({})
