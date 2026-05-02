import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles, TrendingDown, CalendarDays, Coins } from "lucide-react";
import { formatDA } from "@/lib/banks";

export const Route = createFileRoute("/early-payoff")({
  component: EarlyPayoff,
});

interface Inputs {
  amount: number;
  years: number;
  rate: number; // annual % e.g. 6.5
  monthsPaid: number;
  extra: number;
}

const DEFAULTS: Inputs = {
  amount: 5_000_000,
  years: 15,
  rate: 6.5,
  monthsPaid: 24,
  extra: 500_000,
};

function monthlyPayment(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

// Simulate: pay normally until monthsPaid, apply extra to principal, then continue same monthly payment until paid off.
function simulate({ amount, years, rate, monthsPaid, extra }: Inputs) {
  const n = Math.max(1, Math.round(years * 12));
  const r = rate / 100 / 12;
  const M = monthlyPayment(amount, r, n);
  const totalInterestOriginal = M * n - amount;

  // Balance after monthsPaid
  let bal = amount;
  let interestPaidBefore = 0;
  const paidMonths = Math.min(monthsPaid, n);
  for (let i = 0; i < paidMonths; i++) {
    const interest = bal * r;
    const principal = M - interest;
    interestPaidBefore += interest;
    bal -= principal;
    if (bal < 0) bal = 0;
  }

  // Apply extra payment
  const extraApplied = Math.min(extra, bal);
  bal -= extraApplied;

  // Continue with same M until paid
  let monthsRemaining = 0;
  let interestPaidAfter = 0;
  while (bal > 0.01 && monthsRemaining < 1200) {
    const interest = bal * r;
    let principal = M - interest;
    if (principal <= 0) {
      // payment doesn't cover interest — break
      monthsRemaining = Infinity;
      break;
    }
    if (principal > bal) principal = bal;
    interestPaidAfter += principal === bal ? interest * (principal / (M - interest)) : interest;
    bal -= principal;
    monthsRemaining++;
  }

  const newTotalMonths = paidMonths + monthsRemaining;
  const monthsSaved = Math.max(0, n - newTotalMonths);
  const totalInterestNew = interestPaidBefore + interestPaidAfter;
  const interestSaved = Math.max(0, totalInterestOriginal - totalInterestNew);

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + monthsRemaining);

  return {
    monthlyPayment: M,
    originalMonths: n,
    newTotalMonths,
    monthsSaved,
    interestSaved,
    totalInterestOriginal,
    totalInterestNew,
    endDate,
    extraApplied,
  };
}

function EarlyPayoff() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const result = useMemo(() => simulate(inputs), [inputs]);

  const yearsSaved = Math.floor(result.monthsSaved / 12);
  const monthsSavedRem = result.monthsSaved % 12;

  return (
    <div className="mx-auto max-w-md min-h-screen pb-10">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link to="/guide" className="h-10 w-10 rounded-full glass flex items-center justify-center" aria-label="رجوع">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div className="text-sm font-bold">حاسبة السداد المبكر</div>
        <div className="w-10" />
      </div>

      <div className="px-5">
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          احسب كم ستوفّر من الفوائد ومن المدة عند تسديد جزء من قرضك مبكرًا.
        </p>

        <div className="space-y-4">
          <NumField label="مبلغ القرض الأصلي" suffix="دج" value={inputs.amount}
            onChange={(n) => setInputs({ ...inputs, amount: n })} />
          <NumField label="مدة القرض الأصلية" suffix="سنة" value={inputs.years} min={1} max={30}
            onChange={(n) => setInputs({ ...inputs, years: n })} />
          <NumField label="نسبة الفائدة السنوية" suffix="%" value={inputs.rate} step={0.1}
            onChange={(n) => setInputs({ ...inputs, rate: n })} />
          <NumField label="عدد الأشهر المسدّدة" suffix="شهر" value={inputs.monthsPaid} min={0}
            onChange={(n) => setInputs({ ...inputs, monthsPaid: n })} />
          <NumField label="مبلغ السداد المبكر" suffix="دج" value={inputs.extra} min={0}
            onChange={(n) => setInputs({ ...inputs, extra: n })} />
        </div>

        {/* Celebratory result card */}
        <div className="relative rounded-3xl overflow-hidden mt-7 p-6 gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">نتيجة السداد المبكر</span>
            </div>

            {result.monthsSaved === 0 ? (
              <div className="text-sm font-medium opacity-90">
                المبلغ الإضافي صغير جدًا أو الأشهر المسدّدة كثيرة — جرّب قيمًا أخرى.
              </div>
            ) : (
              <>
                <div className="font-display text-4xl font-extrabold leading-tight mb-1">
                  {formatDA(Math.round(result.interestSaved))}
                </div>
                <div className="text-sm opacity-90 mb-5">إجمالي الفوائد الموفّرة 🎉</div>

                <div className="grid grid-cols-2 gap-3">
                  <ResultTile
                    icon={CalendarDays}
                    label="مدّة موفّرة"
                    value={
                      yearsSaved > 0
                        ? `${yearsSaved} سنة${monthsSavedRem ? ` و${monthsSavedRem} شهر` : ""}`
                        : `${result.monthsSaved} شهر`
                    }
                  />
                  <ResultTile
                    icon={TrendingDown}
                    label="نهاية القرض"
                    value={result.endDate.toLocaleDateString("ar-DZ", { year: "numeric", month: "short" })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass rounded-2xl p-4 mt-4 space-y-2 text-sm">
          <Row label="القسط الشهري" value={formatDA(Math.round(result.monthlyPayment))} />
          <Row label="المدة الأصلية" value={`${result.originalMonths} شهر`} />
          <Row label="المدة الجديدة" value={`${result.newTotalMonths} شهر`} />
          <Row label="إجمالي الفوائد بدون سداد مبكر" value={formatDA(Math.round(result.totalInterestOriginal))} />
          <Row label="إجمالي الفوائد بعد السداد المبكر" value={formatDA(Math.round(result.totalInterestNew))} highlight />
        </div>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed mt-4">
          هذه الأرقام تقديرية فقط، يرجى مراجعة البنك للحصول على عرض رسمي.
        </p>
      </div>
    </div>
  );
}

function NumField({
  label, value, onChange, suffix, min, max, step,
}: { label: string; value: number; onChange: (n: number) => void; suffix?: string; min?: number; max?: number; step?: number }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-2">{label}</div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full glass rounded-2xl px-4 py-3 text-base font-bold focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {suffix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function ResultTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/15 backdrop-blur p-3">
      <Icon className="h-4 w-4 mb-1 opacity-80" />
      <div className="text-[10px] opacity-80 mb-0.5">{label}</div>
      <div className="font-display font-bold text-sm leading-tight">{value}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`font-bold text-sm ${highlight ? "gold-text" : ""}`}>{value}</span>
    </div>
  );
}

// silence unused import warning if Coins unused
void Coins;
