/** Records a per-message failure without creating or updating an applicant. */
const ERROR_LOG_HEADERS = ["Timestamp", "MessageID", "Email", "Status", "Error", "FlowName"];

function main(
  workbook: ExcelScript.Workbook,
  messageId: string,
  email: string,
  error: string,
  flowName: string
): string {
  let sheet = workbook.getWorksheet("ProcessingLog");
  if (!sheet) sheet = workbook.addWorksheet("ProcessingLog");

  let table = workbook.getTable("ProcessingLog");
  if (!table) {
    const headerRange = sheet.getRangeByIndexes(0, 0, 1, ERROR_LOG_HEADERS.length);
    headerRange.setValues([ERROR_LOG_HEADERS]);
    table = sheet.addTable(headerRange, true);
    table.setName("ProcessingLog");
  }

  const actualHeaders = table.getHeaderRowRange().getValues()[0].map(value => String(value));
  if (actualHeaders.join("|") !== ERROR_LOG_HEADERS.join("|")) {
    throw new Error("ProcessingLog headers do not match the required schema.");
  }

  const safeError = (error || "Unknown processing failure").slice(0, 2000);
  table.addRow(-1, [
    new Date().toISOString(),
    messageId || "",
    (email || "").trim().toLowerCase(),
    "Failed",
    safeError,
    flowName || "Power Automate"
  ]);

  return JSON.stringify({ logged: true, status: "Failed", messageId: messageId || "" });
}
