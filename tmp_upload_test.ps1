$ErrorActionPreference = 'Stop'

# Config
$signinUrl = 'http://localhost:5001/api/auth/signin'
$uploadUrl = 'http://localhost:5001/api/manager/upload'
$adminDocsUrl = 'http://localhost:5001/api/admin/documents'

# Sign in as default manager
$creds = @{ username = 'manager'; password = 'Manager@123' } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri $signinUrl -Method Post -ContentType 'application/json' -Body $creds
$token = $resp.accessToken
Write-Host "Signed in, token length: $($token.Length)"

# Create a small test file to upload (use .pdf extension so upload middleware accepts it)
$testFile = 'D:\WORKSPACE\BAOCAODOANTK\tmp-upload-test.pdf'
"Test upload from automated check at $(Get-Date)" | Out-File -Encoding utf8 $testFile
Write-Host "Created test file: $testFile"

# Use System.Net.Http.HttpClient to perform a multipart/form-data upload (works in PowerShell 5.1)
[void][System.Reflection.Assembly]::LoadWithPartialName('System.Net.Http')
$handler = [System.Net.Http.HttpClientHandler]::new()
$client = [System.Net.Http.HttpClient]::new($handler)
$client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $token)

$multipart = [System.Net.Http.MultipartFormDataContent]::new()

# File content
$bytes = [System.IO.File]::ReadAllBytes($testFile)
$fileContent = [System.Net.Http.ByteArrayContent]::new($bytes)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse('application/pdf')
$multipart.Add($fileContent, 'file', [System.IO.Path]::GetFileName($testFile))

# Metadata fields
$multipart.Add([System.Net.Http.StringContent]::new('integration-test-file'), 'title')
$multipart.Add([System.Net.Http.StringContent]::new('Uploaded during automated test'), 'description')
$multipart.Add([System.Net.Http.StringContent]::new('manager'), 'accessScope')

Write-Host "Uploading file to $uploadUrl ..."
$response = $client.PostAsync($uploadUrl, $multipart).Result
$respBody = $response.Content.ReadAsStringAsync().Result
Write-Host "Upload HTTP status: $($response.StatusCode)"
Write-Host "Upload response body:`n$respBody"

# Try to fetch admin documents (may require admin role). If unauthorized, show message.
try {
	$docs = Invoke-RestMethod -Uri $adminDocsUrl -Method Get -Headers @{ Authorization = "Bearer $token" }
	if ($null -ne $docs.documents) {
		Write-Host "Admin documents count: $($docs.documents.Count)"
		$latest = $docs.documents | Sort-Object -Property createdAt -Descending | Select-Object -First 1
		Write-Host "Latest document:`n"; $latest | ConvertTo-Json -Depth 6
	} else {
		Write-Host "Admin documents response shape unexpected:`n$($docs | ConvertTo-Json -Depth 4)"
	}
} catch {
	Write-Warning "Failed to GET admin documents (maybe insufficient permissions). Exception: $($_.Exception.Message)"
}
