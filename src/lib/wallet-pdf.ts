import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DOCUMENTS, effectiveStatus, isRequired, type WalletState } from "./wallet";
import type { LoanType } from "./banks";

const LOAN_LABEL_EN: Record<LoanType, string> = {
  real_estate: "Real Estate Loan",
  car: "Car Loan",
  personal: "Personal Loan",
  student: "Student Loan",
};

const STATUS_LABEL: Record<string, string> = {
  ready: "Ready",
  missing: "Missing",
  expired: "Expired",
};

// Latin transliteration of doc labels (jsPDF default fonts don't ship Arabic glyphs)
const DOC_LABEL_EN: Record<string, string> = {
  id_card:    "National ID Card",
  residence:  "Residence Certificate",
  work_cert:  "Work Certificate",
  salary_3m:  "Salary Slips (3 months)",
  bank_6m:    "Bank Statement (6 months)",
  property:   "Property / Rental Contract",
  photos:     "ID Photos",
};

export function generateWalletChecklist(wallet: WalletState, loanType: LoanType) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header (navy)
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pageW, 90, "F");

  // Gold square logo
  doc.setFillColor(201, 168, 76);
  doc.roundedRect(margin, 25, 40, 40, 6, 6, "F");
  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("B", margin + 13, 53);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("BankiDZ — Document Checklist", margin + 55, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(201, 168, 76);
  doc.text(LOAN_LABEL_EN[loanType], margin + 55, 65);

  // Date
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString("en-GB");
  doc.text(`Generated: ${dateStr}`, pageW - margin, 45, { align: "right" });

  // Summary
  let cursorY = 120;
  const required = DOCUMENTS.filter((d) => isRequired(d, loanType));
  const ready = required.filter((d) => effectiveStatus(wallet[d.id]) === "ready").length;
  const ratio = required.length === 0 ? 1 : ready / required.length;

  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Readiness Summary", margin, cursorY);
  cursorY += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Documents ready: ${ready} / ${required.length}  (${Math.round(ratio * 100)}%)`, margin, cursorY);
  cursorY += 20;

  // Progress bar
  const barW = pageW - 2 * margin;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin, cursorY, barW, 8, 4, 4, "F");
  doc.setFillColor(ratio >= 1 ? 60 : 201, ratio >= 1 ? 160 : 168, ratio >= 1 ? 90 : 76);
  doc.roundedRect(margin, cursorY, barW * ratio, 8, 4, 4, "F");
  cursorY += 28;

  // Documents table
  const rows = DOCUMENTS.map((d) => {
    const eff = effectiveStatus(wallet[d.id]);
    const required = isRequired(d, loanType);
    const expiry = wallet[d.id]?.expiry;
    return [
      DOC_LABEL_EN[d.id] ?? d.id,
      required ? "Yes" : "—",
      STATUS_LABEL[eff] ?? eff,
      expiry ? new Date(expiry).toLocaleDateString("en-GB") : "—",
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [["Document", "Required", "Status", "Expiry"]],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [10, 22, 40],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [248, 246, 240] },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const v = String(data.cell.raw);
        if (v === "Ready") data.cell.styles.textColor = [60, 160, 90];
        else if (v === "Missing") data.cell.styles.textColor = [200, 60, 60];
        else if (v === "Expired") data.cell.styles.textColor = [201, 168, 76];
      }
    },
  });

  // Footer note
  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Bring originals + photocopies. Documents older than 3 months may be rejected.",
    margin,
    finalY + 25,
  );

  doc.save(`bankidz-checklist-${loanType}.pdf`);
}
