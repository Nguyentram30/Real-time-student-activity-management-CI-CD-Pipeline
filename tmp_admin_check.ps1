$ErrorActionPreference = 'Stop'

# Sign in as admin
$creds = @{ username = 'admin'; password = 'Admin@123' } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri 'http://localhost:5001/api/auth/signin' -Method Post -ContentType 'application/json' -Body $creds
$token = $resp.accessToken
Write-Host "Admin signed in, token length: $($token.Length)"

# Fetch admin documents
$docs = Invoke-RestMethod -Uri 'http://localhost:5001/api/admin/documents' -Method Get -Headers @{ Authorization = "Bearer $token" }
Write-Host "Admin documents count: $($docs.documents.Count)"
$latest = $docs.documents | Sort-Object -Property createdAt -Descending | Select-Object -First 1
Write-Host "Latest document:`n"
$latest | ConvertTo-Json -Depth 6
