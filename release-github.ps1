# ========================================
#  TMDB_ID-Video - GitHub Release (Upgraded)
# ========================================
#
# Usage:
#   - Set the following environment variables before running:
#       $env:GITHUB_TOKEN   (GitHub personal access token with repo/public_repo scope)
#       $env:GITHUB_REPO    (e.g., seangrrithy/TMDB_ID-Video)
#
# This script creates a GitHub release and uploads the APK artifact.

$ErrorActionPreference = "Stop"
$env:PATH = "C:\Program Files\Git\cmd;C:\Program Files\Git\bin;" + $env:PATH

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TMDB_ID-Video - GitHub Release (Upgraded)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- CONFIG ---
$repo = $env:GITHUB_REPO
if (-not $repo) {
    Write-Host "ERROR: GITHUB_REPO environment variable not set!" -ForegroundColor Red
    exit 1
}
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "ERROR: GITHUB_TOKEN environment variable not set!" -ForegroundColor Red
    exit 1
}
$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github.v3+json" }

# --- STEP 1: Find APK ---
$apk = Get-ChildItem ".\app\build\outputs\apk\release\app-release.apk" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $apk) {
    $apk = Get-ChildItem ".\app\build\outputs\apk\release\*.apk" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
if (-not $apk) {
    Write-Host "ERROR: No APK found in build output!" -ForegroundColor Red
    exit 1
}

# --- STEP 2: Get Version ---
$buildGradle = Get-Content -Path "app/build.gradle.kts"
$versionName = ($buildGradle | Select-String -Pattern 'versionName\s*=\s*"([^"]+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value })
$tagName = "v$versionName"
$releaseName = "Release $tagName"

Write-Host "APK found: $($apk.Name)" -ForegroundColor Green
Write-Host "Tag: $tagName" -ForegroundColor Yellow

# --- STEP 3: Validate Repo and Token ---
Write-Host "Validating repository and token access..." -ForegroundColor Yellow
try {
    $repoResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo" -Headers $headers -Method GET
    Write-Host "Repository access OK: $($repoResp.full_name)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Cannot access repository or invalid token!" -ForegroundColor Red
    Write-Error $_
    exit 1
}

# --- STEP 4: Create Release ---
Write-Host "Creating release on GitHub..." -ForegroundColor Yellow
$releaseData = @{
    tag_name   = $tagName
    name       = $releaseName
    body       = "Automated release for TMDB_ID-Video $tagName"
    draft      = $false
    prerelease = $false
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method POST -Headers $headers -Body $releaseData -ContentType "application/json"
    Write-Host "Release created: $($created.html_url)" -ForegroundColor Green
    # --- STEP 5: Upload APK ---
    Write-Host "Uploading APK..." -ForegroundColor Yellow
    $uploadUrl = $created.upload_url -replace "\{\?name,label\}", "?name=$($apk.Name)"
    $apkBytes = [System.IO.File]::ReadAllBytes($apk.FullName)
    $uploadHeaders = @{ Authorization = "token $token"; "Content-Type" = "application/vnd.android.package-archive" }
    $uploadResp = Invoke-RestMethod -Uri $uploadUrl -Method POST -Headers $uploadHeaders -Body $apkBytes
    Write-Host "APK uploaded: $($uploadResp.browser_download_url)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create release or upload asset." -ForegroundColor Red
    Write-Error $_
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
