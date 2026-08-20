const EMAIL_LOG_HEADERS = [
  "Timestamp", "CandidateID", "Name", "Email", "InitialScreeningScore",
  "EmailType", "Campaign", "Status", "ProviderMessageID", "SentAt", "Error",
  "RetryCount", "FlowRunID"
];

function ensureEmailLog(workbook: ExcelScript.Workbook): ExcelScript.Table {
  let sheet = workbook.getWorksheet("EmailLog");
  if (!sheet) sheet = workbook.addWorksheet("EmailLog");
  let table = workbook.getTable("EmailLog");
  if (!table) {
    const range = sheet.getRangeByIndexes(0, 0, 1, EMAIL_LOG_HEADERS.length);
    range.setValues([EMAIL_LOG_HEADERS]);
    table = sheet.addTable(range, true);
    table.setName("EmailLog");
  }
  const actual = table.getHeaderRowRange().getValues()[0].map(value => String(value));
  if (actual.join("|") !== EMAIL_LOG_HEADERS.join("|")) {
    throw new Error("EmailLog headers do not match the required schema.");
  }
  return table;
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Atomically reserves one campaign email before Outlook is called. */
function main(
  workbook: ExcelScript.Workbook,
  candidateId: string,
  candidateName: string,
  email: string,
  initialScreeningScore: number,
  emailType: string,
  campaign: string,
  flowRunId: string
): string {
  const table = ensureEmailLog(workbook);
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedType = (emailType || "").trim().toUpperCase();
  const normalizedCampaign = (campaign || "").trim();
  if (!candidateId.trim()) throw new Error("CandidateID is required.");
  if (!validEmail(normalizedEmail)) throw new Error("A valid candidate email is required.");
  if (normalizedType !== "SELECTED" && normalizedType !== "REJECTED") {
    throw new Error("EmailType must be SELECTED or REJECTED.");
  }
  if (!Number.isFinite(initialScreeningScore) || initialScreeningScore < 0 || initialScreeningScore > 100) {
    throw new Error("InitialScreeningScore must be between 0 and 100.");
  }
  if (!normalizedCampaign) throw new Error("Campaign is required.");

  const rows = table.getRowCount() > 0
    ? table.getRangeBetweenHeaderAndTotal().getValues()
    : [];
  let match = -1;
  for (let index = rows.length - 1; index >= 0; index--) {
    if (
      String(rows[index][1]) === candidateId &&
      String(rows[index][5]).toUpperCase() === normalizedType &&
      String(rows[index][6]) === normalizedCampaign
    ) {
      match = index;
      break;
    }
  }

  if (match >= 0) {
    const status = String(rows[match][7]).toUpperCase();
    if (status === "SENT" || status === "SENDING") {
      return JSON.stringify({ shouldSend: false, status, reason: "Already reserved or sent" });
    }
    const retryCount = Number(rows[match][11] || 0);
    if (retryCount >= 3) {
      return JSON.stringify({ shouldSend: false, status: "FAILED", reason: "Retry limit reached" });
    }
    const updated = [...rows[match]];
    updated[0] = new Date().toISOString();
    updated[2] = candidateName || "Candidate";
    updated[3] = normalizedEmail;
    updated[4] = initialScreeningScore;
    updated[7] = "SENDING";
    updated[10] = "";
    updated[11] = retryCount + 1;
    updated[12] = flowRunId || "";
    table.getRangeBetweenHeaderAndTotal().getRow(match).setValues([updated]);
    return JSON.stringify({ shouldSend: true, status: "SENDING", retryCount: retryCount + 1 });
  }

  table.addRow(-1, [
    new Date().toISOString(), candidateId, candidateName || "Candidate",
    normalizedEmail, initialScreeningScore, normalizedType, normalizedCampaign,
    "SENDING", "", "", "", 0, flowRunId || ""
  ]);
  return JSON.stringify({ shouldSend: true, status: "SENDING", retryCount: 0 });
}
