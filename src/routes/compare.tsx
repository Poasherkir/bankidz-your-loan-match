import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Sparkles, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { BankLogo } from "@/components/BankLogo";
import { rankBanks, formatDA, LOAN_TYPES } from "@/lib/banks";
import { useInputs } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const [inputs] = useInputs();
  const offers = rankBanks(inputs);
  const loanLabel = LOAN_TYPES.find((l) => l.id === inputs.loanType)?.label;

  return (
    <PageShell>
      <div className="px-5 pt-8 pb-4">
        <div className="text-xs text-muted-foreground mb-2">{loanLabel} • {formatDA(inputs.amount)} • {inputs.years} سنة</div>
        <h1 className="font-display text-2xl font-extrabold">أفضل العروض لك</h1>
        <p className="text-sm text-muted-foreground mt-1">مرتّبة حسب أفضل معدل فائدة وأهليّتك</p>
      </div>

      <div className="px-5 space-y-3">
        {offers.map((offer, idx) => {
          const isBest = idx === 0 && offer.eligible;
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
                <div className="absolute -top-2.5 right-4 px-3 py-1 rounded-full gradient-gold text-gold-foreground text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  الأنسب لك
                </div>
              )}
              <div className="flex items-center gap-3">
                <BankLogo short={offer.bank.short} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{offer.bank.nameAr}</div>
                  <div className="text-xs text-muted-foreground">{offer.bank.name}</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-gold-soft">
                  <div className="text-[10px] text-muted-foreground">الفائدة</div>
                  <div className="text-sm font-bold gold-text">{offer.product.rate}%</div>
                </div>
              </div>

              {offer.eligible ? (
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

        {offers.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
            لا توجد عروض لهذا النوع من القروض حاليًا.
          </div>
        )}
      </div>
    </PageShell>
  );
}
