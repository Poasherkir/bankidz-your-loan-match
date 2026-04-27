import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Row {
  n: number;
  date: string;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

interface Args {
  amount: number;
  years: number;
  rate: number;
  rows: Row[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function generateSchedulePdf({ amount, years, rate, rows }: Args) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setFillColor(201, 168, 76);
  doc.roundedRect(margin, 20, 36, 36, 6, 6, "F");
  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("B", margin + 18, 45, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("BankiDZ", margin + 50, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(201, 168, 76);
  doc.text("Amortization Schedule", margin + 50, 56);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageW - margin, 40, {
    align: "right",
  });

  // Summary
  let y = 110;
  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Loan Summary", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPaid = rows.reduce((s, r) => s + r.payment, 0);
  const lines = [
    ["Loan Amount", `${fmt(amount)} DA`],
    ["Duration", `${years} years (${rows.length} months)`],
    ["Interest Rate", `${rate}%`],
    ["Monthly Payment", `${fmt(rows[0].payment)} DA`],
    ["Total Interest", `${fmt(totalInterest)} DA`],
    ["Total Repayment", `${fmt(totalPaid)} DA`],
  ];
  lines.forEach(([k, v]) => {
    doc.setTextColor(80, 80, 80);
    doc.text(k, margin, y);
    doc.setTextColor(10, 22, 40);
    doc.setFont("helvetica", "bold");
    doc.text(v, pageW - margin, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 14;
  });

  // Table
  y += 10;
  autoTable(doc, {
    startY: y,
    head: [["#", "Date", "Payment", "Interest", "Principal", "Balance"]],
    body: rows.map((r) => [
      r.n,
      r.date,
      fmt(r.payment),
      fmt(r.interest),
      fmt(r.principal),
      fmt(r.balance),
    ]),
    headStyles: { fillColor: [10, 22, 40], textColor: [201, 168, 76], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 246, 240] },
    styles: { fontSize: 8, cellPadding: 4 },
    margin: { left: margin, right: margin },
  });

  doc.save(`bankidz-schedule-${Date.now()}.pdf`);
}
