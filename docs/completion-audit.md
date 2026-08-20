# Completion audit

## Completed and verified locally

- The workbook contains all 45 required `Applicants` columns in the requested order.
- `ApplicantMessages` and `ProcessingLog` use the requested schemas.
- Office Scripts use the Excel Online `ExcelScript` API (not Google Apps Script).
- Extraction covers sender identity, body/HTML, attachments, resume filename heuristics, GitHub, LinkedIn, skills, application type, and transparent 0-100 scoring.
- Upsert normalizes email, assigns stable sequential IDs, prevents replay by MessageID, preserves message history, and logs Success/Failed/Skipped/Duplicate.
- Empty/unknown evidence remains blank; no negative skill claim is inferred.
- Development and production configuration contain publish-safe placeholders and no credentials.

## Required in every deployer's Microsoft tenant

- Upload the workbook to OneDrive/SharePoint.
- Create all Office Scripts listed in the implementation guide in Excel for the web.
- Create and bind the Outlook and Excel connector connections.
- Create/export the actual cloud flows and replace the current design JSON.
- Resolve the configured applicant folder to its immutable folder ID.
- Run the historical import and verify every message page, retry behavior, and concurrency in the tenant.
- Enable the new-mail trigger after the historical run.

## Known optional dependency

PDF/DOC/DOCX text extraction is not part of the baseline. Use AI Builder (licensed capacity) or Azure AI Document Intelligence. The flow remains functional for message fields without either service.
