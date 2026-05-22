# ── Test Azure AI Foundry Conversations API endpoints ──
# Validated endpoint format:
#   https://RESOURCE.services.ai.azure.com/api/projects/PROJECT/openai/v1/responses
#   https://RESOURCE.services.ai.azure.com/api/projects/PROJECT/openai/v1/conversations
# Token scope: https://ai.azure.com

$base = "https://alexz1008-foundry-hrs1.services.ai.azure.com/api/projects/proj-default/openai/v1"
$agentName = "hrs-agent"
$agentVersion = "3"

# ── TOKEN ──
$token = ""
if (-not $token) {
    Write-Host "No token set — fetching via az cli (scope: ai.azure.com)..." -ForegroundColor Yellow
    $token = az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv
    if (-not $token) {
        Write-Host "ERROR: az cli returned empty token. Run 'az login' first." -ForegroundColor Red
        exit 1
    }
    Write-Host "Token acquired." -ForegroundColor Green
}

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $token"
}

# ─── Step 1: Test Responses endpoint ───
Write-Host "`n=== Step 1: Responses with agent_reference ===" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$base/responses" -Method POST -Headers $headers -ContentType "application/json" -Body (@{
        agent_reference = @{ name = $agentName; type = "agent_reference"; version = $agentVersion }
        input = @(@{ role = "user"; content = "Say hello in one sentence." })
    } | ConvertTo-Json -Depth 5)
    $text = ($r.Content | ConvertFrom-Json).output.content | Where-Object { $_.type -eq "output_text" } | Select-Object -First 1 -ExpandProperty text
    Write-Host "SUCCESS: $text" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# ─── Step 2: Create conversation (empty body) ───
Write-Host "`n=== Step 2: Create conversation ===" -ForegroundColor Cyan
$convId = $null
try {
    $r = Invoke-WebRequest -Uri "$base/conversations" -Method POST -Headers $headers -ContentType "application/json" -Body '{}'
    $convId = ($r.Content | ConvertFrom-Json).id
    Write-Host "SUCCESS: conversation=$convId" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# ─── Step 3: Response with conversation + input ───
Write-Host "`n=== Step 3: Response using conversation ===" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$base/responses" -Method POST -Headers $headers -ContentType "application/json" -Body (@{
        agent_reference = @{ name = $agentName; type = "agent_reference"; version = $agentVersion }
        conversation = $convId
        input = @(@{ role = "user"; content = "What is the capital of France?" })
    } | ConvertTo-Json -Depth 5)
    $text = ($r.Content | ConvertFrom-Json).output.content | Where-Object { $_.type -eq "output_text" } | Select-Object -First 1 -ExpandProperty text
    Write-Host "SUCCESS: $text" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# ─── Step 4: Follow-up in same conversation ───
Write-Host "`n=== Step 4: Follow-up (should reference France) ===" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$base/responses" -Method POST -Headers $headers -ContentType "application/json" -Body (@{
        agent_reference = @{ name = $agentName; type = "agent_reference"; version = $agentVersion }
        conversation = $convId
        input = @(@{ role = "user"; content = "And what is its population?" })
    } | ConvertTo-Json -Depth 5)
    $text = ($r.Content | ConvertFrom-Json).output.content | Where-Object { $_.type -eq "output_text" } | Select-Object -First 1 -ExpandProperty text
    Write-Host "SUCCESS: $($text.Substring(0, [Math]::Min(200, $text.Length)))..." -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# ─── Step 5: Delete conversation ───
Write-Host "`n=== Step 5: Delete conversation ===" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "$base/conversations/$convId" -Method DELETE -Headers $headers -ContentType "application/json" | Out-Null
    Write-Host "SUCCESS: Conversation deleted" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n=== All tests complete ===" -ForegroundColor Cyan
Write-Host "If Step 0b failed with 404, the conversations endpoint may use a different path — check the Azure docs for your resource." -ForegroundColor Yellow
