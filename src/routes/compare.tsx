import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, Sparkles, AlertCircle, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { BankLogo } from "@/components/BankLogo";
import { rankBanks, formatDA, LOAN_TYPES } from "@/lib/banks";
import { useInputs } from "@/lib/store";
import { maxEligibleLoan } from "@/lib/finance-data";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

type Filter = "all" | "eligible" | "ineligible";

function ComparePage() {
  const [inputs] = useInputs();
  const [filter, setFilter] = useState<Filter>("all");

  const offers = rankBanks(inputs);
  const loanLabel = LOAN_TYPES.find((l) => l.id === inputs.loanType)?.label;

  const maxLoan = useMemo(
    () => maxEligibleLoan(inputs.salary, inputs.age),
    [inputs.salary, inputs.age]
  );
  const yearsLeft = Math.max(1, 60 - inputs.age);
  const salaryCap = inputs.salary * 0.4;

  const visible = offers.filter((o) =>
    filter === "all" ? true : filter === "eligible" ? o.eligible : !o.eligible
  );

  return (
    <PageShell>
      <div className="px-5 pt-8 pb-4">
        <div className="text-xs text-muted-foreground mb-2">
          {loanLabel} • {formatDA(inputs.amount)} • {inputs.years} سنة
        </div>
        <h1 className="font-display text-2xl font-extrabold">أفضل العروض لك</h1>
        <p className="text-sm text-muted-foreground mt-1">مرتّبة حسب أفضل معدل فائدة وأهليّتك</p>
      </div>

      {/* Eligibility card */}
      <div className="px-5 mb-4">
        <div className="rounded-2xl p-4 gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4" />
            <span className="text-[11px] font-bold opacity-80">حدّك الأقصى التقديري</span>
          </div>
          <div className="font-display text-2xl font-extrabold leading-tight">
            {formatDA(maxLoan)}
          </div>
          <p className="text-[11px] mt-2 opacity-90 leading-relaxed">
            بناءً على راتبك ({formatDA(inputs.salary)}) وعمرك ({inputs.age} سنة)، يمكنك تحمّل قسط
            شهري حتى {formatDA(salaryCap)} على {yearsLeft} سنة.
          </p>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="px-5 mb-3">
        <div className="glass rounded-2xl p-1 flex">
          {([
            { id: "all", label: "الكل" },
            { id: "eligible", label: "المناسب لي ✅" },
            { id: "ineligible", label: "غير مناسب ❌" },
          ] as { id: Filter; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-colors ${
                filter === f.id ? "bg-gold text-gold-foreground" : "text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        {visible.map((offer, idx) => {
          const isBest = idx === 0 && offer.eligible && filter !== "ineligible";
          const ratio = Math.min(1, offer.monthly / salaryCap);
          const ratioPct = Math.round(ratio * 100);
          const barColor =
            ratio < 0.7 ? "var(--success)" : ratio < 1 ? "var(--gold)" : "var(--destructive)";

          return (
            <Link
              key={offer.bank.id}
              to="/bank/$bankId"
              params={{ bankId: offer.bank.id }}
              className={`relative block rounded-2xl p-4 transition-all active:scale-[0.99] ${
                isBest
                  ? "border-2 border-gold bg-gold-soft shadow-[var(--shadow-gold)]"
                  : offer.eligible
                  ? "glass"
                  : "glass opacity-60"
              }`}
            >
              {isBest && (
                <div className="absolute -top-2.5 right-4 flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full gradient-gold text-gold-foreground text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    الأنسب لك
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-md"
                    style={{ backgroundColor: "oklch(0.65 0.17 155)" }}
                  >
                    Best Match
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <BankLogo short={offer.bank.short} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm truncate">{offer.bank.nameAr}</div>
                    {offer.eligible ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--success)" }} />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{offer.bank.name}</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-gold-soft">
                  <div className="text-[10px] text-muted-foreground">الفائدة</div>
                  <div className="text-sm font-bold gold-text">{offer.product.rate}%</div>
                </div>
              </div>

              {offer.eligible ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-surface/50 p-3">
                      <div className="text-[10px] text-muted-foreground mb-1">القسط الشهري</div>
                      <div className="font-display font-bold text-base">{formatDA(offer.monthly)}</div>
                    </div>
                    <div className="rounded-xl bg-surface/50 p-3">
                      <div className="text-[10px] text-muted-foreground mb-1">إجمالي الفوائد</div>
                      <div className="font-display font-bold text-base">{formatDA(offer.totalInterest)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">نسبة من حد الـ 40% للراتب</span>
                      <span className="font-bold" style={{ color: barColor }}>{ratioPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${ratioPct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div className="text-xs text-destructive">{offer.reason}</div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>عرض التفاصيل</span>
                <ChevronLeft className="h-4 w-4" />
              </div>
            </Link>
          );
        })}

        {visible.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
            لا توجد نتائج لهذا الفلتر.
          </div>
        )}
      </div>
    </PageShell>
  );
}
