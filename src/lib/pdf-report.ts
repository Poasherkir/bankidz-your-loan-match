import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BANKS, LOAN_TYPES, formatDA, monthlyPayment, rankBanks } from "./banks";
import type { SimInputs } from "./store";

const LOAN_LABEL_EN: Record<string, string> = {
  real_estate: "Real Estate Loan",
  car: "Car Loan",
  personal: "Personal Loan",
  student: "Student Loan",
};

// Format DA for PDF (Latin digits, no Arabic suffix)
function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n)) + " DA";
}

export function generateReport(inputs: SimInputs) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  const rate = inputs.rate ?? 6.5;
  const monthly = monthlyPayment(inputs.amount, rate, inputs.years);
  const total = monthly * inputs.years * 12;
  const interest = total - inputs.amount;

  const loanLabelAr = LOAN_TYPES.find((l) => l.id === inputs.loanType)?.label ?? "";
  const loanLabelEn = LOAN_LABEL_EN[inputs.loanType] ?? inputs.loanType;

  // ===== Header (navy bar) =====
  doc.setFillColor(10, 22, 40); // #0A1628
  doc.rect(0, 0, pageW, 90, "F");

  // Gold square logo
  doc.setFillColor(201, 168, 76); // #C9A84C
  doc.roundedRect(margin, 25, 40, 40, 6, 6, "F");
  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("B", margin + 20, 52, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("BankiDZ", margin + 55, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(201, 168, 76);
  doc.text("Algerian Bank Loan Report", margin + 55, 64);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString("en-GB");
  doc.text(`Generated: ${dateStr}`, pageW - margin, 48, { align: "right" });

  let y = 120;

  // ===== Section: Loan Parameters =====
  sectionTitle(doc, "Loan Parameters", margin, y);
  y += 22;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Parameter", "Value"]],
    body: [
      ["Loan Type", loanLabelEn],
      ["Requested Amount", fmt(inputs.amount)],
      ["Duration", `${inputs.years} years (${inputs.years * 12} months)`],
      ["Interest Rate", `${rate}% / year`],
      ["Monthly Salary", fmt(inputs.salary)],
      ["Age", `${inputs.age} years`],
    ],
    theme: "grid",
    headStyles: { fillColor: [10, 22, 40], textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [248, 246, 240] },
    columnStyles: { 0: { cellWidth: 200, fontStyle: "bold" } },
  });

  // @ts-expect-error - lastAutoTable is set by autoTable
  y = doc.lastAutoTable.finalY + 25;

  // ===== Section: Simulator Results (gold highlight box) =====
  sectionTitle(doc, "Simulation Results", margin, y);
  y += 14;

  doc.setFillColor(201, 168, 76);
  doc.roundedRect(margin, y, pageW - margin * 2, 90, 8, 8, "F");

  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Estimated Monthly Payment", margin + 20, y + 25);
  doc.setFontSize(26);
  doc.text(fmt(monthly), margin + 20, y + 55);

  // Sub-stats inside gold box
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Total Repayment", margin + 20, y + 75);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(fmt(total), margin + 20, y + 88 - 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Total Interest", margin + 220, y + 75);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(fmt(interest), margin + 220, y + 88 - 1);

  y += 110;

  // ===== Section: Best Match Banks =====
  const offers = rankBanks(inputs);
  const eligible = offers.filter((o) => o.eligible);
  const top = eligible.length > 0 ? eligible : offers;

  sectionTitle(doc, "Top Bank Offers", margin, y);
  y += 22;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Rank", "Bank", "Rate", "Monthly", "Total Interest", "Status"]],
    body: top.slice(0, 6).map((o, i) => [
      i === 0 && o.eligible ? "★ 1" : `${i + 1}`,
      `${o.bank.short} - ${o.bank.name}`,
      `${o.product.rate}%`,
      fmt(o.monthly),
      fmt(o.totalInterest),
      o.eligible ? "Eligible" : "Not Eligible",
    ]),
    theme: "grid",
    headStyles: { fillColor: [10, 22, 40], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [248, 246, 240] },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 0 && top[0].eligible) {
        data.cell.styles.fillColor = [253, 246, 220];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 5) {
        const isEligible = top[data.row.index].eligible;
        data.cell.styles.textColor = isEligible ? [40, 130, 70] : [180, 50, 50];
      }
    },
  });

  // @ts-expect-error - lastAutoTable
  y = doc.lastAutoTable.finalY + 20;

  // ===== Best Match details =====
  if (top[0] && top[0].eligible) {
    if (y > 680) { doc.addPage(); y = 60; }
    const best = top[0];

    sectionTitle(doc, `Best Match: ${best.bank.name}`, margin, y);
    y += 18;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      body: [
        ["Bank Name", best.bank.name],
        ["Loan Product", loanLabelEn],
        ["Annual Interest Rate", `${best.product.rate}%`],
        ["Minimum Salary Required", fmt(best.product.minSalary)],
        ["Maximum Loan Amount", fmt(best.product.maxAmount)],
        ["Maximum Duration", `${best.product.maxYears} years`],
        ["Age Range", `${best.bank.minAge} - ${best.bank.maxAge} years`],
        ["Estimated Monthly Payment", fmt(best.monthly)],
      ],
      theme: "plain",
      bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
      columnStyles: { 0: { cellWidth: 200, fontStyle: "bold", textColor: [10, 22, 40] } },
    });
  }

  // ===== Footer on every page =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(margin, ph - 35, pageW - margin, ph - 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "BankiDZ - For informational purposes only. Confirm final terms with the bank.",
      margin,
      ph - 22,
    );
    doc.text(`Page ${i} / ${pageCount}`, pageW - margin, ph - 22, { align: "right" });
  }

  // Filename
  const filename = `BankiDZ-Report-${inputs.loanType}-${Date.now()}.pdf`;
  doc.save(filename);
}

function sectionTitle(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFillColor(201, 168, 76);
  doc.rect(x, y - 10, 4, 14, "F");
  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(text, x + 10, y);
}

// Suppress unused-import warning if BANKS unused at top level
void BANKS;
