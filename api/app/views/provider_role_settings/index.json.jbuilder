json.data do
  json.roleSettings role_settings do |role_setting|
    json.partial! "provider_role_settings/provider_role_setting", provider_role_setting: role_setting
  end
end

json.error nil
json.meta({})
