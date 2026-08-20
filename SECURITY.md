# Security policy

## Reporting a vulnerability

Please report security issues privately to the repository maintainers through
GitHub's private vulnerability reporting feature. Do not open a public issue
containing credentials, tenant identifiers, applicant data, or exploit details.

## Data and credential safety

This project processes personal data from email and resumes. Deployers are
responsible for consent, retention, access control, regional privacy law, and
Microsoft 365 licensing requirements.

Never commit:

- applicant workbooks, resumes, message bodies, or flow run histories;
- Power Platform authentication profiles or access/refresh tokens;
- tenant, environment, mailbox, folder, workbook, drive, item, connection, or
  Office Script IDs;
- exported solutions whose connection bindings or environment-variable current
  values have not been sanitized.

Use connection references and environment variables. Authenticate interactively
in the target tenant; this repository does not require or accept organization credentials.
