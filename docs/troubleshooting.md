# Troubleshooting

## `pac` command not found

Install the Power Platform CLI and confirm it is available on PATH.

## Authentication issues

Use:

```powershell
pac auth create --deviceCode
```

If the device code flow times out, sign back in and repeat the flow.

## Outlook folder not found

Verify the configured folder path or folder ID.

Use the folder name `Interview_AI/ML_Intern` and make sure the flow runs against the correct mailbox and subfolder.

## Excel workbook not found

Ensure the workbook exists in OneDrive or SharePoint and the `EXCEL_FILE_PATH` is correct.

## Duplicate records created

Confirm that the deduplication logic uses normalized email and an upsert pattern. The project is designed to avoid duplicates across reruns.

## Historical import stops early

Check pagination configuration and ensure the flow is set to process all pages.

## Resume not parsed

This is expected when the attachment is not a parseable PDF or native document service is unavailable. The logging should set `ScreeningNotes = "Resume parsing unavailable"`.

## Flow throttling

Reduce concurrency or increase the retry interval if Graph throttling is encountered.
