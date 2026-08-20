const FINAL_EMAIL_LOG_HEADERS = [
  "Timestamp", "CandidateID", "Name", "Email", "InitialScreeningScore",
  "EmailType", "Campaign", "Status", "ProviderMessageID", "SentAt", "Error",
  "RetryCount", "FlowRunID"
];

/** Marks the matching reserved campaign email SENT or FAILED. */
function main(
  workbook: ExcelScript.Workbook,
  candidateId: string,
  emailType: string,
  campaign: string,
  status: string,
  providerMessageId: string,
  error: string,
  flowRunId: string
): string {
  const table = workbook.getTable("EmailLog");
  if (!table) throw new Error("EmailLog table is missing. Run ReserveCandidateEmail first.");
  const headers = table.getHeaderRowRange().getValues()[0].map(value => String(value));
  if (headers.join("|") !== FINAL_EMAIL_LOG_HEADERS.join("|")) {
    throw new Error("EmailLog headers do not match the required schema.");
  }
  const normalizedType = (emailType || "").trim().toUpperCase();
  const normalizedStatus = (status || "").trim().toUpperCase();
  if (normalizedStatus !== "SENT" && normalizedStatus !== "FAILED") {
    throw new Error("Status must be SENT or FAILED.");
  }
  const rows = table.getRowCount() > 0
    ? table.getRangeBetweenHeaderAndTotal().getValues()
    : [];
  let match = -1;
  for (let index = rows.length - 1; index >= 0; index--) {
    if (
      String(rows[index][1]) === candidateId &&
      String(rows[index][5]).toUpperCase() === normalizedType &&
      String(rows[index][6]) === campaign
    ) {
      match = index;
      break;
    }
  }
  if (match < 0) throw new Error("Reserved email log entry was not found.");
  if (String(rows[match][7]).toUpperCase() === "SENT") {
    return JSON.stringify({ updated: false, status: "SENT", reason: "Already sent" });
  }
  const updated = [...rows[match]];
  updated[0] = new Date().toISOString();
  updated[7] = normalizedStatus;
  updated[8] = providerMessageId || "";
  updated[9] = normalizedStatus === "SENT" ? new Date().toISOString() : "";
  updated[10] = normalizedStatus === "FAILED" ? (error || "Unknown send failure").slice(0, 2000) : "";
  updated[12] = flowRunId || String(updated[12] || "");
  table.getRangeBetweenHeaderAndTotal().getRow(match).setValues([updated]);
  return JSON.stringify({ updated: true, status: normalizedStatus });
}
