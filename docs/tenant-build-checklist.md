# Tenant build checklist

Target environment: your Power Platform development environment. Never commit its environment ID or URL.

This checklist is for real solution-aware cloud flows. Do not create test or non-solution flows.

## Required tenant assets

- Office 365 Outlook connection
- Excel Online (Business) connection
- A OneDrive for Business or SharePoint workbook
- Office Scripts: `ProcessApplicant`, `UpsertApplicant`, `ValidateApplicants`

## Required additional script

Create `LogProcessingError` in Excel for the web from `office-scripts/LogProcessingError.ts`.

## Solution metadata

- Display name: `Applicant Automation`
- Unique name: `ApplicantAutomation`
- Publisher display name: `YOUR ORGANIZATION`
- Publisher prefix: `pan`
- Version: `1.0.0.0`

## Connection references

- `org_Office365Outlook` -> Office 365 Outlook connection
- `org_ExcelOnlineBusiness` -> Excel Online (Business) connection

## Environment variables

- `org_OUTLOOK_FOLDER_NAME` = `Interview_AI/ML_Intern`
- `org_OUTLOOK_FOLDER_ID` = selected folder identifier
- `org_EXCEL_FILE_PATH` = canonical OneDrive workbook URL
- `org_EXCEL_TABLE_NAME` = `Applicants`

## Historical flow controls

- Manual trigger
- Outlook `Get emails (V3)` scoped to `Interview_AI/ML_Intern`
- Include attachments: Yes
- Pagination enabled with threshold at least 5000
- Apply-to-each concurrency: 1
- Per-message Try scope: `ProcessApplicant` then `UpsertApplicant`
- Per-message Catch scope: `LogProcessingError`, configured to run after Try failure or timeout
- Retry policy for connector actions: exponential, count 3

## New-email flow controls

- Office 365 Outlook `When a new email arrives (V3)` scoped to the same folder
- Include attachments: Yes
- Trigger concurrency: 1
- Same Try/Catch script chain as historical processing
- Leave the flow turned off until the historical import is validated

## Post-build ALM

After the real components exist in Dataverse, export/clone the solution with `pac solution clone`. Replace the design artifacts in `src/power-platform` with that canonical export, run `pac solution check`, pack, import, and verify both workflow records in Dataverse.
