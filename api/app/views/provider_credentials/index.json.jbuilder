json.data do
  json.credentials credentials do |credential|
    json.partial! "provider_credentials/provider_credential", provider_credential: credential
  end
end

json.error nil
json.meta({})
