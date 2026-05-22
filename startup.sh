#!/bin/bash
# Azure App Service startup script
# Writes Application Settings into config.json so the SPA can read them at runtime.

CONFIG_PATH="/home/site/wwwroot/config.json"

cat <<EOF > "$CONFIG_PATH"
{
  "ENTRA_CLIENT_ID": "${ENTRA_CLIENT_ID}",
  "ENTRA_TENANT_ID": "${ENTRA_TENANT_ID}",
  "ENTRA_API_SCOPE": "${ENTRA_API_SCOPE:-https://ai.azure.com/.default}",
  "API_URL": "${API_URL}",
  "API_BASE_URL": "${API_BASE_URL}",
  "AGENT_NAME": "${AGENT_NAME:-EBCChatbot}",
  "AGENT_VERSION": "${AGENT_VERSION:-8}"
}
EOF

echo "config.json written to $CONFIG_PATH"

# Serve the SPA with a simple static file server
npx serve /home/site/wwwroot --single --listen ${PORT:-8080}
