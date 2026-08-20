# Deployment Guide

## Prerequisites

- Power Platform environment with Power Automate enabled
- Microsoft Outlook connector access
- Excel for the web connector access
- Microsoft 365 or SharePoint access for the target workbook
- Power Platform CLI installed and authenticated

## Install Power Platform CLI

### Windows

```powershell
winget install Microsoft.PowerPlatform.CLI
```

### Linux/macOS

Follow the official Microsoft installation steps for the Power Platform CLI and verify with:

```bash
pac --version
```

## Authenticate

```powershell
pac auth create --deviceCode
```

This starts a secure device code authentication flow.

## Set environment variables

Update the configuration files in `config/development.json` and `config/production.json` with the correct SharePoint/OneDrive workbook path and folder ID.

## Setup

```powershell
pwsh ./scripts/setup.ps1
```

## Deploy

```powershell
pwsh ./scripts/deploy.ps1
```

## Validate

```powershell
pwsh ./scripts/validate.ps1
```

## Import solution

Use the Power Platform CLI to import the solution package after packing it.

## Authorize connectors

In the target environment, authorize:

- Outlook
- Excel
- SharePoint or OneDrive

## Run historical import

Open the flow `Applicant Automation - Historical Applicant Import` and run it manually.

## Enable new applicant trigger

Turn on the `Applicant Automation - New Applicant Processor` flow.

## Workbook creation

Create the Excel workbook in SharePoint or OneDrive and ensure the Excel tables are present:

- `Applicants`
- `ApplicantMessages`
- `ProcessingLog`

Alternatively, let Office Scripts create the workbook structure if the workbook is empty.

## Install and call the Office Scripts

1. Open the workbook in Excel for the web and create scripts named `ProcessApplicant`, `UpsertApplicant`, and `ValidateApplicants` from the matching files in `office-scripts/`.
2. In each flow, run `ProcessApplicant` with the serialized Graph message (and optional `attachmentText`).
3. Pass its string result to `UpsertApplicant`, together with the flow name.
4. Run `ValidateApplicants` after deployment; its JSON result must contain `"valid":true`.

`ProcessApplicant` deliberately does not invent fields. Binary resume text must be supplied by AI Builder or Azure AI Document Intelligence. Without it, normal email extraction continues and the screening note records that resume parsing is unavailable.

## Flow artifact limitation

The checked-in flow JSON documents the intended control flow but is not a tenant-exported Power Platform solution. Do not pack or import it as a completed flow. Create the flows in the target tenant, bind the Office 365 Outlook and Excel Online (Business) connections, then export/unpack the solution to replace these artifacts. This is necessary because connection references, workbook IDs, script IDs, and trigger subscriptions are assigned by Microsoft 365/Power Platform in the target tenant.
