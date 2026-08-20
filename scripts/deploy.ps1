$ErrorActionPreference = 'Stop'

if (-not (Get-Command pac -ErrorAction SilentlyContinue)) {
    throw "Power Platform CLI (pac) is not installed. Install it before deployment."
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$packageDir = Join-Path $root "src/power-platform/solution"
$outDir = Join-Path $root "out"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$zipPath = Join-Path $outDir "ApplicantAutomation.zip"

Write-Host "Packing solution..." -ForegroundColor Cyan
pac solution pack --folder $packageDir --zipfile $zipPath

Write-Host "Solution packed to: $zipPath" -ForegroundColor Green
Write-Host "Next step: pac auth create --deviceCode" -ForegroundColor Yellow
Write-Host "Then run: pac solution import --environment <environment-url-or-id> --file $zipPath" -ForegroundColor Yellow
