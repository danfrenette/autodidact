json.data do
  json.credential do
    json.partial! "provider_credentials/provider_credential", provider_credential: credential
  end
end

json.error nil
json.meta({})
