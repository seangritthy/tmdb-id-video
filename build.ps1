#!/usr/bin/env pwsh
# Build and Auto-Release Script for Windows PowerShell

# Set up environment for Java and GitHub CLI
$jdkDir = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$ghDir = "C:\Program Files\GitHub CLI"
$env:JAVA_HOME = $jdkDir
$env:Path = "$jdkDir\bin;$ghDir;$env:Path"

# Auto-increment versionCode and versionName before build
$buildGradle = Get-Content -Path "app/build.gradle.kts"
$versionCode = ($buildGradle | Select-String -Pattern 'versionCode\s*=\s*(\d+)' | ForEach-Object { [int]$_.Matches[0].Groups[1].Value })
$versionName = ($buildGradle | Select-String -Pattern 'versionName\s*=\s*"([^"]+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value })

$newVersionCode = $versionCode + 1
$parts = $versionName -split '\.'
if ($parts.Length -eq 3) {
    $parts[2] = ([int]$parts[2] + 1).ToString()
    $newVersionName = "$($parts[0]).$($parts[1]).$($parts[2])"
} else {
    $newVersionName = $versionName
}

$buildGradle = $buildGradle -replace "versionCode\s*=\s*\d+", "versionCode = $newVersionCode"
$escapedVersionName = 'versionName = "' + $newVersionName + '"'
$buildGradle = $buildGradle -replace 'versionName\s*=\s*"[^"]+"', $escapedVersionName
Set-Content -Path "app/build.gradle.kts" -Value $buildGradle


# Clean and build release APK
Write-Host "Cleaning and building release APK..."
$buildResult = & ./gradlew.bat clean assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed. Not releasing."
    exit 1
}

# Wait 10 seconds before running release script
Write-Host "Build succeeded. Waiting 10 seconds before release..."
Start-Sleep -Seconds 10

# Run GitHub release script
Write-Host "Running release-github.ps1 after build..."
$releaseResult = & ./release-github.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Release script failed."
    exit 1
}

Write-Host "Build and auto-release process complete."
