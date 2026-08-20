# Open-source release checklist

Run this checklist before every public release.

## Repository contents

- Include source Office Scripts, generic flow design documentation, setup docs,
  the MIT license, and sanitized configuration templates.
- Do not include the production applicant workbook or any copied workbook, even
  when rows appear deleted. Deleted strings can remain inside an XLSX package.
- Do not include flow run exports, screenshots containing applicant details,
  authentication profiles, or tenant-bound solution exports.

## Secret and privacy scan

From the repository root, run:

```bash
rg -n -i --hidden --glob '!.git/**' \
  'client.secret|access.token|refresh.token|password|<YOUR-TENANT-DOMAIN>|<KNOWN-FOLDER-ID-PREFIX>|admin@'
```

Replace the two angle-bracket markers with your real tenant domain and the
recognizable prefix of any known resource ID, then review every match. Also
inspect the staged file list before committing:

```bash
git status --short
git diff --cached --name-only
```

## Safe configuration

- Keep committed configuration values generic.
- Put deployment-specific values in `config/development.local.json` or
  `config/production.local.json`; both are ignored by Git.
- Create connector authorizations manually in each user's Microsoft tenant.
- Store the Outlook folder ID and workbook location as environment-variable
  current values in that tenant, never as repository defaults.

## GitHub publication

```bash
git init
git add .
git status --short
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/<OWNER>/<REPOSITORY>.git
git push -u origin main
```

Create the GitHub repository without adding a generated README or license because
this project already contains both. Review the staged files before the commit.
