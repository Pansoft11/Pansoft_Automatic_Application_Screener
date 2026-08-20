# Candidate email campaign — Power Automate build guide

This solution-aware, manually triggered flow sends one personalized message per
candidate. Selected candidates receive the approved Screening form link; rejected
candidates receive the approved rejection notice. A blank score is manual review
and never causes an email.

## Safety gates

Do not run a bulk mode until all of these are true:

1. The historical import has finished.
2. Recruiters have reviewed the scores and names.
3. Any messages sent before enabling this flow have been reconciled in
   `EmailLog` as `SENT` using exact candidate details.
4. TEST mode has delivered the selected and rejected templates to an internal
   test mailbox and the content has been approved.
5. The run confirmation input contains the exact text `CONFIRM SEND`.

## Workbook scripts and table

Create these Office Scripts in the same workbook:

- `ReserveCandidateEmail` from `office-scripts/ReserveCandidateEmail.ts`
- `FinalizeCandidateEmail` from `office-scripts/FinalizeCandidateEmail.ts`

The first reserve call creates `EmailLog` with these columns:

```text
Timestamp, CandidateID, Name, Email, InitialScreeningScore, EmailType,
Campaign, Status, ProviderMessageID, SentAt, Error, RetryCount, FlowRunID
```

The unique logical key is `Campaign + CandidateID + EmailType`. A `SENT` or
`SENDING` row is not sent again. A failed row may be retried up to three times.

## Environment variables

Create these in the `Applicant Automation` solution:

- `org_EMAIL_CAMPAIGN_NAME`: `Applicant Campaign`
- `org_SELECTION_THRESHOLD`: `80`
- `org_SCREENING_FORM_URL`: `https://form.example.com/your-screening-form`
- `org_EMAIL_SEND_DELAY_SECONDS`: `5`

Use the existing Excel Online (Business) and Office 365 Outlook connection
references. Never put credentials in an environment variable.

## Create the flow

Create an instant solution-aware cloud flow named:

```text
Applicant Automation - Candidate Email Campaign
```

Add four manual-trigger inputs:

- `SendMode` (Text): `TEST`, `SELECTED`, or `REJECTED`
- `Confirmation` (Text): must equal `CONFIRM SEND`
- `TestRecipient` (Email): required for TEST mode
- `TestCandidateEmail` (Email): exact `Applicants` email used to render TEST

Add an initial condition. Terminate as Failed unless `SendMode` is `TEST`, or
`Confirmation` exactly equals `CONFIRM SEND`.

Add Excel Online (Business) **List rows present in a table**:

- File: the configured applicant workbook
- Table: `Applicants`
- Pagination: On
- Threshold: `5000`

Add **Filter array** from the List rows `value`. Use this advanced expression:

```powerautomate
@and(
  not(empty(item()?['Email'])),
  not(empty(item()?['InitialScreeningScore'])),
  or(
    and(
      equals(toUpper(coalesce(triggerBody()?['sendMode'], '')), 'TEST'),
      equals(
        toLower(trim(coalesce(item()?['Email'], ''))),
        toLower(trim(coalesce(triggerBody()?['testCandidateEmail'], '')))
      )
    ),
    and(
      equals(toUpper(coalesce(triggerBody()?['sendMode'], '')), 'SELECTED'),
      greaterOrEquals(float(coalesce(item()?['InitialScreeningScore'], '0')), 80)
    ),
    and(
      equals(toUpper(coalesce(triggerBody()?['sendMode'], '')), 'REJECTED'),
      less(float(coalesce(item()?['InitialScreeningScore'], '0')), 80)
    )
  )
)
```

Use the environment-variable threshold instead of literal `80` once the
expression is working. Keep the `coalesce` calls because filter predicates can
evaluate conversions even when an earlier `empty` check is false.

Add **Apply to each** over the Filter array body. Open Settings, enable
Concurrency Control, and set Degree of Parallelism to `1`.

Inside the loop, calculate `EmailType`:

```powerautomate
if(
  greaterOrEquals(float(items('Apply_to_each')?['InitialScreeningScore']), 80),
  'SELECTED',
  'REJECTED'
)
```

Run `ReserveCandidateEmail` with the row fields, campaign name, and:

```powerautomate
workflow()?['run']?['name']
```

Parse the script result with:

```powerautomate
json(body('Reserve_Candidate_Email')?['result'])
```

Continue only when `shouldSend` equals `true`.

## TEST mode

TEST mode must send to `TestRecipient`, never to the candidate address. It should
process at most one row per template during validation. Prefix the subject with
`[TEST]` and include the intended candidate email in the test-only header/body.
TEST mode must not finalize the candidate's production key as `SENT`; use a
campaign value suffixed with ` - TEST`.

## Create and send the Outlook message

For auditable provider IDs, use Office 365 Outlook **Send an HTTP request**:

1. `POST https://graph.microsoft.com/v1.0/me/messages` to create a draft.
2. Store the response `id` as `ProviderMessageID`.
3. `POST https://graph.microsoft.com/v1.0/me/messages/{encoded-id}/send`.
4. Call `FinalizeCandidateEmail` with status `SENT` and the draft ID.

If any create/send action fails or times out, call `FinalizeCandidateEmail` from
a catch scope with status `FAILED`, blank provider ID when unavailable, and:

```powerautomate
string(result('Send_Email_Try'))
```

Add a Delay after every candidate using `EMAIL_SEND_DELAY_SECONDS`. Configure the
delay to run after success, failure, timeout, and skip.

## Approved message templates

Copy the checked-in `templates/selected-email.html` and
`templates/rejected-email.html` into the corresponding Compose actions. Replace
the three `{{...}}` markers with dynamic content. Populate only:

- Candidate name (fallback `Candidate` when blank)
- Exact initial screening score
- Screening form URL for selected candidates only

Use only organization-approved role terms. Never promise selection or employment,
and never include the screening-form link in the rejection template.

## Production sequence

1. Run TEST for one selected candidate, one score-80 candidate, and one rejected
   candidate, all redirected to an internal test mailbox.
2. Reconcile any previously sent messages as `SENT` in `EmailLog`.
3. Run `SELECTED` with `CONFIRM SEND` and review the completed run and `EmailLog`.
4. Resolve failures; retry only `FAILED` rows.
5. Run `REJECTED` with `CONFIRM SEND` and review the completed run and `EmailLog`.
6. Never include blank-score candidates in either run.
