import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Home, KeyRound, Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatDA } from "@/lib/banks";

export const Route = createFileRoute("/rent-vs-buy")({
  component: RentVsBuy,
});

interface Inputs {
  rent: number;          // monthly rent DZD
  price: number;         // property price DZD
  down: number;          // down payment DZD
  years: number;         // loan duration in years
  rate: number;          // annual interest %
  rentIncrease: number;  // annual rent increase %
  appreciation: number;  // annual property appreciation %
}

const DEFAULTS: Inputs = {
  rent: 35000,
  price: 12_000_000,
  down: 2_000_000,
  years: 20,
  rate: 6.5,
  rentIncrease: 4,
  appreciation: 3,
};

const HORIZONS = [5, 10, 15, 20] as const;

function monthlyPayment(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

function balanceAfter(P: number, r: number, n: number, monthsPaid: number) {
  if (monthsPaid >= n) return 0;
  if (r === 0) return P - (P / n) * monthsPaid;
  const M = monthlyPayment(P, r, n);
  return P * Math.pow(1 + r, monthsPaid) - M * ((Math.pow(1 + r, monthsPaid) - 1) / r);
}

function totalRentOver(rentMonthly: number, years: number, increasePct: number) {
  let total = 0;
  let r = rentMonthly;
  for (let y = 0; y < years; y++) {
    total += r * 12;
    r *= 1 + increasePct / 100;
  }
  return total;
}

function compute(i: Inputs) {
  const loanAmount = Math.max(0, i.price - i.down);
  const n = Math.max(1, i.years * 12);
  const r = i.rate / 100 / 12;
  const monthly = monthlyPayment(loanAmount, r, n);

  return HORIZONS.map((h) => {
    const months = Math.min(h * 12, n);
    const totalLoanPaid = monthly * months + i.down;
    const remaining = balanceAfter(loanAmount, r, n, months);
    const rentTotal = totalRentOver(i.rent, h, i.rentIncrease);
    const propValue = i.price * Math.pow(1 + i.appreciation / 100, h);
    const owned = h * 12 >= n;
    // Net buy cost = total paid out - (property value - remaining loan balance)
    const buyNet = totalLoanPaid - (propValue - remaining);
    return { years: h, rentTotal, totalLoanPaid, remaining, propValue, owned, buyNet, monthly };
  });
}

function RentVsBuy() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const rows = useMemo(() => compute(inputs), [inputs]);

  // Recommendation: based on 20-year horizon
  const final = rows[rows.length - 1];
  const buyBetter = final.buyNet < final.rentTotal;
  const diff = Math.abs(final.rentTotal - final.buyNet);
  const monthlyTooHigh = final.monthly > inputs.rent * 2.5;

  return (
    <div className="mx-auto max-w-md min-h-screen pb-10">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link to="/guide" className="h-10 w-10 rounded-full glass flex items-center justify-center" aria-label="رجوع">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div className="text-sm font-bold">إيجار أم قرض؟</div>
        <div className="w-10" />
      </div>

      <div className="px-5">
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          قارن بين الاستمرار في الإيجار وشراء العقار بقرض، على مدى 5 إلى 20 سنة.
        </p>

        <div className="space-y-4">
          <NumField label="الإيجار الشهري الحالي" suffix="دج" value={inputs.rent}
            onChange={(n) => setInputs({ ...inputs, rent: n })} />
          <NumField label="ثمن العقار" suffix="دج" value={inputs.price}
            onChange={(n) => setInputs({ ...inputs, price: n })} />
          <NumField label="الدفعة الأولى المتوفرة" suffix="دج" value={inputs.down}
            onChange={(n) => setInputs({ ...inputs, down: n })} />
          <NumField label="مدة القرض" suffix="سنة" value={inputs.years} min={5} max={30}
            onChange={(n) => setInputs({ ...inputs, years: n })} />
          <div className="grid grid-cols-3 gap-2">
            <NumField label="فائدة" suffix="%" value={inputs.rate} step={0.1}
              onChange={(n) => setInputs({ ...inputs, rate: n })} />
            <NumField label="ارتفاع الإيجار" suffix="%/سنة" value={inputs.rentIncrease} step={0.5}
              onChange={(n) => setInputs({ ...inputs, rentIncrease: n })} />
            <NumField label="ارتفاع العقار" suffix="%/سنة" value={inputs.appreciation} step={0.5}
              onChange={(n) => setInputs({ ...inputs, appreciation: n })} />
          </div>
        </div>

        {/* Monthly payment summary */}
        <div className="glass rounded-2xl p-4 mt-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-muted-foreground">القسط الشهري للقرض</div>
            <div className="font-display text-xl font-extrabold gold-text">{formatDA(Math.round(final.monthly))}</div>
          </div>
          <div className="text-left">
            <div className="text-[11px] text-muted-foreground">الإيجار الحالي</div>
            <div className="font-display text-xl font-extrabold">{formatDA(inputs.rent)}</div>
          </div>
        </div>

        {/* Comparison cards */}
        <h2 className="font-display text-base font-extrabold mt-6 mb-3">المقارنة بمرور الوقت</h2>
        <div className="space-y-3">
          {rows.map((row) => {
            const buyWins = row.buyNet < row.rentTotal;
            return (
              <div key={row.years} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-extrabold text-sm">بعد {row.years} سنوات</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    buyWins ? "bg-emerald-500/20 text-emerald-400" : "bg-gold-soft gold-text"
                  }`}>
                    {buyWins ? "الشراء أفضل" : "الإيجار أفضل"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Side
                    icon={KeyRound}
                    label="إيجار"
                    primary={formatDA(Math.round(row.rentTotal))}
                    sub="إجمالي مدفوع"
                    tone="rent"
                  />
                  <Side
                    icon={Home}
                    label="شراء بقرض"
                    primary={formatDA(Math.round(row.totalLoanPaid))}
                    sub={row.owned ? "✅ ملك كامل" : `متبقي: ${formatDA(Math.round(row.remaining))}`}
                    tone="buy"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                  <Row label="قيمة العقار المتوقعة" value={formatDA(Math.round(row.propValue))} />
                  <Row label="التكلفة الصافية للشراء" value={formatDA(Math.round(row.buyNet))}
                    hint="القسط + الدفعة − (قيمة العقار − الرصيد)" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendation */}
        <div className={`relative overflow-hidden rounded-3xl p-5 mt-6 ${
          buyBetter ? "gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]" : "glass"
        }`}>
          {buyBetter && <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />}
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Scale className={`h-5 w-5 ${buyBetter ? "" : "text-gold"}`} />
              <span className="text-xs font-bold uppercase tracking-wide">توصيتنا</span>
            </div>
            <div className="font-display text-xl font-extrabold mb-2 leading-tight">
              {buyBetter
                ? "الشراء بقرض أفضل لك على المدى الطويل 🏠"
                : "الاستمرار في الإيجار أكثر مرونة حالياً 🔑"}
            </div>
            <p className={`text-sm leading-relaxed ${buyBetter ? "opacity-95" : "text-muted-foreground"}`}>
              {buyBetter ? (
                <>
                  بعد 20 سنة، الشراء يوفّر حوالي <b>{formatDA(Math.round(diff))}</b> ويمنحك ملكية كاملة للعقار.
                  {monthlyTooHigh && " ⚠️ لكن انتبه: القسط الشهري أعلى بكثير من إيجارك الحالي، تأكّد من قدرتك على تحمّله."}
                </>
              ) : (
                <>
                  بعد 20 سنة، الإيجار يكلّفك تقريباً <b>{formatDA(Math.round(diff))}</b> أقل، خصوصاً إذا كنت لا تخطط للاستقرار طويلاً في نفس المدينة.
                </>
              )}
            </p>

            {/* signals */}
            <div className="mt-4 space-y-2">
              <Signal
                ok={inputs.down >= inputs.price * 0.2}
                text={`الدفعة الأولى ${inputs.down >= inputs.price * 0.2 ? "كافية" : "أقل من 20% — قد يرفض البنك"}`}
                inverted={buyBetter}
              />
              <Signal
                ok={!monthlyTooHigh}
                text={`القسط الشهري ${monthlyTooHigh ? "مرتفع مقارنة بإيجارك" : "في حدود معقولة"}`}
                inverted={buyBetter}
              />
            </div>
          </div>
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
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full glass rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function Side({ icon: Icon, label, primary, sub, tone }: { icon: React.ElementType; label: string; primary: string; sub: string; tone: "rent" | "buy" }) {
  return (
    <div className={`rounded-xl p-3 ${tone === "buy" ? "bg-gold-soft border border-gold/30" : "bg-surface/60"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${tone === "buy" ? "text-gold" : "text-muted-foreground"}`} />
        <span className="text-[10px] font-bold">{label}</span>
      </div>
      <div className={`font-display text-sm font-extrabold leading-tight ${tone === "buy" ? "gold-text" : ""}`}>{primary}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-[11px]" title={hint}>{label}</span>
      <span className="font-bold text-xs">{value}</span>
    </div>
  );
}

function Signal({ ok, text, inverted }: { ok: boolean; text: string; inverted?: boolean }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  const color = inverted
    ? "opacity-90"
    : ok ? "text-emerald-500" : "text-amber-500";
  return (
    <div className={`flex items-center gap-2 text-xs ${color}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
