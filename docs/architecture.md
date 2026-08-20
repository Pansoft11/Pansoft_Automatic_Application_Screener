# Architecture

## Overview

The solution is designed to process Outlook messages in a controlled, idempotent, and audit-friendly way.

## Flow design

### 1. Historical import

- Manual trigger
- Resolve Outlook folder by name or configured folder ID
- Enumerate the folder with pagination using Graph `mailFolders/{id}/messages`
- Process messages in batches
- For each message, retrieve the full body, attachments, and metadata
- Extract applicant fields
- Parse resume and extract structured skills
- Normalize and deduplicate using email and message identity
- Upsert the applicant into Excel
- Log each processed result and any failures

### 2. New email processing

- Trigger: `When a new email arrives` in the configured Outlook folder
- Validate folder membership and message type
- Skip messages outside the configured folder
- Process the message once
- Upsert to Excel based on normalized email
- Log status

## Data flow

Outlook folder -> Graph -> Power Automate -> Excel -> Applicant tables + ProcessingLog

## Deduplication strategy

- Primary duplicate key: normalized email address
- Secondary check: name + subject similarity
- Preserve latest `MessageID`, `ReceivedDate`, and `OutlookLink`
- Add `DuplicateFlag = Yes` for duplicate records or duplicate emails
- Keep `ApplicantMessages` as a history table

## Resume parsing strategy

The solution should prefer Microsoft-native, available services when possible.

Basic pattern:

- If a resume is a PDF/DOC/DOCX and can be parsed by a connector or service, extract fields
- If parsing is unavailable, leave fields blank and set `ScreeningNotes = "Resume parsing unavailable"`

This ensures the workflow still works without requiring an additional AI service or license.

## Rate limiting and reliability

- Use pagination rather than a single large Graph call
- Limit concurrency to a small number of parallel branches
- Add retry policies to transient Graph and Excel failures
- Use per-email exception handling so one message failure does not stop the whole run

## Idempotency

The flow must be safe to rerun. It uses the unique email identity and message ID to prevent duplicate applicant entries.

## Excel tables

- `Applicants` - current deduplicated applicant view
- `ApplicantMessages` - full message history per candidate
- `ProcessingLog` - success/failure audit log

## Environment variables

- `OUTLOOK_FOLDER_NAME`
- `OUTLOOK_FOLDER_ID`
- `EXCEL_FILE_PATH`
- `EXCEL_TABLE_NAME`

## External dependencies

Optional enhancements:

- Azure AI Document Intelligence
- AI Builder
- Premium connectors for advanced PDF parsing and OCR

None are required for the baseline implementation.
