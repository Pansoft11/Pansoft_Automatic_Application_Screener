# Contributing

Contributions are welcome through GitHub issues and pull requests.

Before submitting a change:

1. Do not include real applicant messages, resumes, workbooks, run histories,
   tenant URLs, resource IDs, connection bindings, or credentials.
2. Run `pwsh ./scripts/validate.ps1`.
3. Run `ValidateApplicants` against a new workbook containing synthetic data only.
4. Document changes to extraction or scoring rules. Scoring must remain transparent
   and must not automatically reject an applicant.
5. Keep historical processing idempotent and Excel concurrency at one.

By contributing, you agree that your contribution is licensed under the MIT License.
