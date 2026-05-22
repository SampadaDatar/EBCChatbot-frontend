# ── Test Azure AI Foundry Conversations API endpoints ──
# Usage:
#   1. Get a bearer token (e.g. from browser DevTools Network tab, or `az account get-access-token`)
#   2. Set $token below
#   3. Run this script: .\test-conversations-api.ps1
#
# This validates the REST endpoints before integrating into the React app.

$base = "https://alexz1008-foundry-hrs1.openai.azure.com/openai/v1"
$agentName = "EBCChatbot"  # Change to match your AGENT_NAME config
$agentVersion = "8"         # Change to match your AGENT_VERSION config

# ── SET YOUR TOKEN HERE (or leave empty to auto-fetch via az cli) ──
$token = ""
# You can get this from:
#   - Browser DevTools → Network → copy the Authorization header from an existing chat request
#   - Or: az account get-access-token --resource https://cognitiveservices.azure.com --query accessToken -o tsv

if (-not $token) {
    Write-Host "No token set — attempting to fetch via az cli..." -ForegroundColor Yellow
    try {
        $token = az account get-access-token --resource https://cognitiveservices.azure.com --query accessToken -o tsv
    } catch {
        Write-Host "ERROR: az cli token fetch failed. Set `$token manually." -ForegroundColor Red
        exit 1
    }
    if (-not $token) {
        Write-Host "ERROR: az cli returned empty token. Run 'az login' first." -ForegroundColor Red
        exit 1
    }
    Write-Host "Token acquired via az cli." -ForegroundColor Green
}

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $token"
}

Write-Host "`n=== Step 0a: Test Responses endpoint (current behavior) ===" -ForegroundColor Cyan
try {
    $body = @{
        input = @(
            @{ role = "user"; content = "Say hello in one sentence." }
        )
        agent_reference = @{ name = $agentName; type = "agent_reference"; version = $agentVersion }
    } | ConvertTo-Json -Depth 5

    $resp = Invoke-RestMethod -Uri "$base/responses" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS - Response:" -ForegroundColor Green
    Write-Host ($resp | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())" -ForegroundColor Red
}

Write-Host "`n=== Step 0b: Create a conversation ===" -ForegroundColor Cyan
$conversationId = $null
try {
    $body = @{
        items = @(
            @{ type = "message"; role = "user"; content = "What is the capital of France?" }
        )
    } | ConvertTo-Json -Depth 5

    # Try without api-version first, then with common versions
    $convUrl = "$base/conversations"
    Write-Host "Trying: $convUrl" -ForegroundColor Gray
    $resp = Invoke-RestMethod -Uri $convUrl -Method POST -Headers $headers -Body $body
    $conversationId = $resp.id
    Write-Host "SUCCESS - Conversation ID: $conversationId" -ForegroundColor Green
    Write-Host ($resp | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())" -ForegroundColor Red
    } catch {}
}

if (-not $conversationId) {
    Write-Host "`nCannot continue without a conversation ID. Fix the endpoint above first." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== Step 0c: Generate response using conversation ===" -ForegroundColor Cyan
try {
    $body = @{
        conversation = $conversationId
        agent        = @{ name = $agentName; type = "agent_reference" }
    } | ConvertTo-Json -Depth 5

    $resp = Invoke-RestMethod -Uri "$base/responses" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS - Agent response:" -ForegroundColor Green
    Write-Host "output_text: $($resp.output_text)" -ForegroundColor Gray
    Write-Host ($resp | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())" -ForegroundColor Red
    } catch {}
}

Write-Host "`n=== Step 0d: Add follow-up message + second response ===" -ForegroundColor Cyan
try {
    $body = @{
        items = @(
            @{ type = "message"; role = "user"; content = "And what is its population?" }
        )
    } | ConvertTo-Json -Depth 5

    $resp = Invoke-RestMethod -Uri "$base/conversations/$conversationId/items" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS - Added message to conversation" -ForegroundColor Green
    Write-Host ($resp | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} catch {
    Write-Host "FAILED adding message: $_" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())" -ForegroundColor Red
    } catch {}
}

try {
    $body = @{
        conversation = $conversationId
        agent        = @{ name = $agentName; type = "agent_reference" }
    } | ConvertTo-Json -Depth 5

    $resp = Invoke-RestMethod -Uri "$base/responses" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS - Second response (should reference France):" -ForegroundColor Green
    Write-Host "output_text: $($resp.output_text)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())" -ForegroundColor Red
    } catch {}
}

Write-Host "`n=== Step 0e: Delete conversation ===" -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "$base/conversations/$conversationId" -Method DELETE -Headers $headers
    Write-Host "SUCCESS - Conversation deleted" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())" -ForegroundColor Red
    } catch {}
}

Write-Host "`n=== All tests complete ===" -ForegroundColor Cyan
Write-Host "If all steps passed, the Conversations API is available and you can proceed with code integration." -ForegroundColor White
Write-Host "If Step 0b failed with 404, the conversations endpoint may use a different path — check the Azure docs for your resource." -ForegroundColor Yellow
