import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Printer,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import {
  DOCUMENTS,
  type DocStatus,
  type DocDef,
  useWallet,
  effectiveStatus,
  daysUntilExpiry,
  computeReadiness,
  isRequired,
} from "@/lib/wallet";
import { LOAN_TYPES, type LoanType } from "@/lib/banks";
import { generateWalletChecklist } from "@/lib/wallet-pdf";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

const STATUS_META: Record<
  DocStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  ready:   { label: "جاهز",          color: "var(--success)",     icon: CheckCircle2 },
  missing: { label: "ناقص",          color: "var(--destructive)", icon: XCircle },
  expired: { label: "منتهي الصلاحية", color: "var(--gold)",        icon: Clock },
};

function StatusPill({ status }: { status: DocStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        backgroundColor: `color-mix(in oklab, ${m.color} 18%, transparent)`,
        color: m.color,
      }}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function StatusButton({
  active,
  status,
  onClick,
}: {
  active: boolean;
  status: DocStatus;
  onClick: () => void;
}) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
      style={{
        backgroundColor: active ? m.color : "transparent",
        color: active ? "white" : m.color,
        border: `1px solid ${active ? m.color : `color-mix(in oklab, ${m.color} 35%, transparent)`}`,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {m.label}
    </button>
  );
}

function DocCard({
  doc,
  status,
  expiry,
  onStatus,
  onExpiry,
}: {
  doc: DocDef;
  status: DocStatus;
  expiry: string | null;
  onStatus: (s: DocStatus) => void;
  onExpiry: (v: string | null) => void;
}) {
  const days = daysUntilExpiry({ status, expiry, updatedAt: 0 });
  const expiringSoon = days !== null && days >= 0 && days <= 30;
  const expired = days !== null && days < 0;

  return (
    <div className="rounded-2xl p-4 glass">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-gold-soft flex items-center justify-center text-xl shrink-0">
          {doc.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight">{doc.label}</div>
          <div className="mt-1">
            <StatusPill status={expired ? "expired" : status} />
            {expiringSoon && !expired && (
              <span className="ms-2 inline-flex items-center gap-1 text-[10px] font-bold text-gold">
                <AlertTriangle className="h-3 w-3" />
                ينتهي خلال {days} يوم
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <StatusButton active={status === "ready"} status="ready" onClick={() => onStatus("ready")} />
        <StatusButton active={status === "missing"} status="missing" onClick={() => onStatus("missing")} />
      </div>

      {doc.hasExpiry && (
        <label className="flex items-center gap-2 mt-2 text-[11px]">
          <CalendarIcon className="h-3.5 w-3.5 text-gold shrink-0" />
          <span className="text-muted-foreground shrink-0">تاريخ الانتهاء:</span>
          <input
            type="date"
            value={expiry ?? ""}
            onChange={(e) => onExpiry(e.target.value || null)}
            className="flex-1 h-8 px-2 rounded-lg glass text-[11px] outline-none focus:ring-2 focus:ring-gold/40"
            dir="ltr"
          />
        </label>
      )}
    </div>
  );
}

function WalletPage() {
  const [wallet, setWallet] = useWallet();
  const [selectedLoan, setSelectedLoan] = useState<LoanType>("real_estate");

  function setStatus(id: string, status: DocStatus) {
    const prev = wallet[id] ?? { status: "missing", expiry: null, updatedAt: 0 };
    setWallet({ ...wallet, [id]: { ...prev, status, updatedAt: Date.now() } });
  }
  function setExpiry(id: string, expiry: string | null) {
    const prev = wallet[id] ?? { status: "missing", expiry: null, updatedAt: 0 };
    setWallet({ ...wallet, [id]: { ...prev, expiry, updatedAt: Date.now() } });
  }

  const readiness = useMemo(() => computeReadiness(wallet, selectedLoan), [wallet, selectedLoan]);
  const ready100 = readiness.ratio >= 1;

  const expiringDocs = DOCUMENTS.filter((d) => {
    const days = daysUntilExpiry(wallet[d.id]);
    return days !== null && days >= 0 && days <= 30;
  });

  function handlePrint() {
    generateWalletChecklist(wallet, selectedLoan);
  }

  return (
    <PageShell>
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/guide" className="text-[12px] text-muted-foreground active:scale-95">
            ← الدليل
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-full bg-gold-soft flex items-center justify-center">
            <Wallet className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              محفظة <span className="gold-text">وثائقي</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              تتبّع جاهزية ملفك للقرض في أي بنك
            </p>
          </div>
        </div>

        {/* Expiry warnings */}
        {expiringDocs.length > 0 && (
          <div className="rounded-2xl p-3 mb-4 glass" style={{ borderRight: "3px solid var(--gold)" }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              <div className="text-[12px] leading-relaxed">
                <div className="font-bold mb-0.5">تنبيه انتهاء الصلاحية</div>
                {expiringDocs.map((d) => {
                  const days = daysUntilExpiry(wallet[d.id]) ?? 0;
                  return (
                    <div key={d.id} className="text-muted-foreground">
                      {d.label} — خلال {days} يوم
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Readiness checker */}
        <div className="rounded-2xl p-4 glass mb-4">
          <div className="text-[11px] gold-text font-medium mb-2">فاحص الجاهزية الذكي</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {LOAN_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedLoan(t.id)}
                className={`h-10 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  selectedLoan === t.id
                    ? "gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]"
                    : "glass text-foreground"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div
            className="rounded-xl p-3"
            style={{
              borderTop: `3px solid ${ready100 ? "var(--success)" : "var(--destructive)"}`,
              background: "color-mix(in oklab, var(--surface) 60%, transparent)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-display font-extrabold text-sm">
                {ready100 ? "✔️ ملفك جاهز" : "❌ ملفك غير مكتمل"}
              </div>
              <div className="text-[11px] font-bold gold-text">
                {readiness.ready}/{readiness.total} وثائق
              </div>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden mb-2">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.round(readiness.ratio * 100)}%`,
                  background: ready100 ? "var(--success)" : "var(--gold)",
                }}
              />
            </div>
            {readiness.missingDocs.length + readiness.expiredDocs.length > 0 && (
              <div className="space-y-1 mt-2">
                <div className="text-[11px] font-bold text-destructive">الوثائق الناقصة:</div>
                {[...readiness.missingDocs, ...readiness.expiredDocs].map((d) => (
                  <div
                    key={d.id}
                    className="text-[11px] text-destructive flex items-center gap-1.5"
                  >
                    <XCircle className="h-3 w-3 shrink-0" />
                    {d.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Print button */}
        <button
          type="button"
          onClick={handlePrint}
          className="w-full h-12 mb-4 rounded-2xl glass border border-gold/30 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Printer className="h-4 w-4 text-gold" />
          طباعة قائمة وثائقي (PDF)
          <ChevronLeft className="h-4 w-4 text-gold" />
        </button>

        {/* Documents list */}
        <h2 className="font-display font-bold text-sm mb-2">وثائقي</h2>
        <div className="space-y-3">
          {DOCUMENTS.map((d) => {
            const entry = wallet[d.id];
            const status = effectiveStatus(entry);
            const requiredHere = isRequired(d, selectedLoan);
            return (
              <div key={d.id} className={requiredHere ? "" : "opacity-70"}>
                <DocCard
                  doc={d}
                  status={status === "expired" ? "missing" : status}
                  expiry={entry?.expiry ?? null}
                  onStatus={(s) => setStatus(d.id, s)}
                  onExpiry={(v) => setExpiry(d.id, v)}
                />
                {!requiredHere && (
                  <div className="text-[10px] text-muted-foreground mt-1 text-center">
                    غير مطلوبة لـ {LOAN_TYPES.find((l) => l.id === selectedLoan)?.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
