# vault-policy.hcl - Policy for reading EduGov secrets
# Allow the app to read secret key-value configurations at 'secret/data/edugov'

path "secret/data/edugov" {
  capabilities = ["read"]
}

# Allow reading secret engine metadata
path "secret/metadata/edugov" {
  capabilities = ["read", "list"]
}
