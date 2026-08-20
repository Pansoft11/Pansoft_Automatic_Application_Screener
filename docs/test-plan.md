# Test Plan

## Functional tests

1. Email with no attachment
2. Email with one PDF
3. Email with multiple attachments
4. Email containing GitHub URL
5. Email containing LinkedIn URL
6. Email with GitHub URL only in resume
7. Duplicate email
8. Reply email
9. Empty email
10. Invalid attachment
11. Missing applicant name
12. Missing email
13. Historical import across multiple Graph pages with a dataset larger than one page
14. New applicant arrival

## Expected behaviors

- Applicant data is extracted without hard-coded message IDs.
- Duplicate emails are not duplicated in the `Applicants` table.
- `ApplicantMessages` preserves message history.
- `ProcessingLog` records all success, failure, duplicate, and skipped states.
- Screening score is a transparent initial score from 0 to 100.
- `ScreeningNotes` explains the score.
- The flow handles pagination and throttling.

## Pass criteria

- All records are stored in the correct Excel tables.
- All environment variables are configured correctly.
- No records are created outside the target folder.
- The solution is idempotent for reruns.
