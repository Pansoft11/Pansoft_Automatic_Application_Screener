$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Host "Export utilities are available in the Power Platform environment after authentication." -ForegroundColor Cyan
Write-Host "Use pac solution export --environment <environment> --name ApplicantAutomation --managed false" -ForegroundColor Yellow
