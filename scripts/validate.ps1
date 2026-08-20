$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$filesToCheck = @(
    (Join-Path $root "config/development.json"),
    (Join-Path $root "config/production.json"),
    (Join-Path $root "src/power-platform/solution/solution.xml"),
    (Join-Path $root "src/power-platform/flows/Applicant-Automation-Historical-Import.json"),
    (Join-Path $root "src/power-platform/flows/Applicant-Automation-New-Applicant-Processor.json"),
    (Join-Path $root "src/power-platform/flows/Applicant-Automation-Candidate-Email-Campaign.json"),
    (Join-Path $root "office-scripts/ProcessApplicant.ts"),
    (Join-Path $root "office-scripts/UpsertApplicant.ts"),
    (Join-Path $root "office-scripts/ValidateApplicants.ts"),
    (Join-Path $root "office-scripts/LogProcessingError.ts"),
    (Join-Path $root "office-scripts/ReserveCandidateEmail.ts"),
    (Join-Path $root "office-scripts/FinalizeCandidateEmail.ts"),
    (Join-Path $root "LICENSE"),
    (Join-Path $root "SECURITY.md")
)

foreach ($file in $filesToCheck) {
    if (-not (Test-Path $file)) {
        throw "Missing required file: $file"
    }

    $content = Get-Content -Path $file -Raw
    if ($file -like "*.json" -or $file -like "*.xml") {
        try {
            if ($file -like "*.json") {
                $null = $content | ConvertFrom-Json
            }
            else {
                [xml]$content | Out-Null
            }
        }
        catch {
            throw "Invalid JSON/XML in $file : $($_.Exception.Message)"
        }
    }
}

$forbiddenPatterns = @(
    '[A-Za-z0-9-]+-my\.sharepoint\.com',
    'org[0-9]+\.crm[0-9]*\.dynamics\.com',
    'Default-[0-9a-fA-F-]{36}',
    'AAMkAG[A-Za-z0-9_=-]+',
    '(?i)client[_-]?secret\s*[:=]',
    '(?i)(access|refresh)[_-]?token\s*[:=]'
)

$publishableFiles = Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $_.FullName -notmatch '[\\/]\.git[\\/]' -and
    $_.FullName -notmatch '[\\/]out[\\/]' -and
    $_.FullName -notmatch '[\\/]out-canonical-review[\\/]' -and
    $_.Extension -notin @('.xlsx', '.xlsm', '.xlsb', '.zip')
}

foreach ($file in $publishableFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    foreach ($pattern in $forbiddenPatterns) {
        if ($content -match $pattern) {
            throw "Potential tenant-specific or secret value in $($file.FullName): pattern $pattern"
        }
    }
}

Write-Host "All project files validated successfully." -ForegroundColor Green
