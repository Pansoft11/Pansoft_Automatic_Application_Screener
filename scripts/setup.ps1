$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$repoRoot = Resolve-Path $root

Write-Host "Applicant Automation setup" -ForegroundColor Cyan
Write-Host "Workspace root: $repoRoot" -ForegroundColor Gray

if (-not (Get-Command pac -ErrorAction SilentlyContinue)) {
    Write-Warning "Power Platform CLI (pac) is not installed. Install it before deploying."
    Write-Host "Windows: winget install Microsoft.PowerPlatform.CLI" -ForegroundColor Yellow
    Write-Host "Linux/macOS: follow Microsoft Learn installation instructions for pac." -ForegroundColor Yellow
    exit 1
}

$envFiles = @(
  "$repoRoot/config/development.json",
  "$repoRoot/config/production.json"
)

foreach ($file in $envFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing configuration file: $file"
    }
}

Write-Host "Setup complete. Review config files and authenticate with pac before import." -ForegroundColor Green
