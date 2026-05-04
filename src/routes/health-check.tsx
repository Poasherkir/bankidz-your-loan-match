import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, HeartPulse, Lightbulb } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { formatDA } from "@/lib/banks";

export const Route = createFileRoute("/health-check")({
  component: HealthCheckPage,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-[12px] text-muted-foreground mb-1.5">{label}</div>
      <div className="relative">
        <input
          inputMode="numeric"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          placeholder={placeholder ?? "0"}
          className="w-full h-12 rounded-xl glass px-4 text-right font-display font-bold text-base outline-none focus:ring-2 focus:ring-gold/50"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
          دج
        </span>
      </div>
    </label>
  );
}

function Gauge({ score, color }: { score: number; color: string }) {
  const size = 180;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="var(--surface)" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-extrabold text-5xl" style={{ color }}>
          {score}
        </div>
        <div className="text-[11px] text-muted-foreground">من 100</div>
      </div>
    </div>
  );
}

interface Result {
  score: number;
  tierLabel: string;
  color: string;
  tips: string[];
  debtRatio: number;
  expenseRatio: number;
  savingsRatio: number;
}

function computeHealth(salary: number, debts: number, expenses: number): Result | null {
  if (salary <= 0) return null;
  const debtRatio = Math.min(1, debts / salary);
  const expenseRatio = Math.min(1, expenses / salary);
  const totalOut = Math.min(1, (debts + expenses) / salary);
  const savingsRatio = Math.max(0, 1 - totalOut);

  // Score: savings (50) + low-debt (30) + expense control (20)
  const score = Math.round(
    Math.max(0, Math.min(100, savingsRatio * 50 + (1 - debtRatio) * 30 + (1 - expenseRatio) * 20)),
  );

  let tierLabel: string;
  let color: string;
  if (score <= 40) {
    tierLabel = "وضع حرج";
    color = "var(--destructive)";
  } else if (score <= 70) {
    tierLabel = "وضع متوسط";
    color = "var(--gold)";
  } else {
    tierLabel = "وضع ممتاز";
    color = "var(--success)";
  }

  const tips: string[] = [];
  if (debtRatio >= 0.4) {
    tips.push(`ديونك تستهلك ${Math.round(debtRatio * 100)}% من راتبك. ركّز على تسديدها قبل أي قرض جديد.`);
  } else if (debtRatio >= 0.2) {
    tips.push("نسبة ديونك مقبولة لكن حاول تخفيضها تحت 20% لتحسين أهليتك للقرض.");
  } else {
    tips.push("نسبة ديونك ممتازة (أقل من 20%) — هذا يعزز ثقة البنوك بك.");
  }

  if (expenseRatio >= 0.7) {
    tips.push("مصاريفك تتجاوز 70% من راتبك. راجع بنود الإنفاق غير الضرورية شهرياً.");
  } else if (expenseRatio >= 0.5) {
    tips.push("ضع ميزانية شهرية مكتوبة وقلّص 10% من المصاريف الترفيهية.");
  } else {
    tips.push("تتحكم جيداً في مصاريفك — استثمر الفائض في حساب توفير أو ذهب.");
  }

  if (savingsRatio < 0.1) {
    tips.push("لا يبقى لك تقريباً شيء في آخر الشهر. ابدأ بادخار 5% فقط من الراتب تلقائياً.");
  } else if (savingsRatio < 0.2) {
    tips.push(`توفّر حالياً ${Math.round(savingsRatio * 100)}% من راتبك. الهدف الذهبي هو 20% شهرياً.`);
  } else {
    tips.push(`ممتاز! توفّر ${Math.round(savingsRatio * 100)}% شهرياً. خصص جزءاً لصندوق طوارئ يغطي 6 أشهر.`);
  }

  return { score, tierLabel, color, tips, debtRatio, expenseRatio, savingsRatio };
}

function HealthCheckPage() {
  const [salary, setSalary] = useState("");
  const [debts, setDebts] = useState("");
  const [expenses, setExpenses] = useState("");

  const result = useMemo(
    () => computeHealth(Number(salary) || 0, Number(debts) || 0, Number(expenses) || 0),
    [salary, debts, expenses],
  );

  return (
    <PageShell>
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/" className="text-[12px] text-muted-foreground active:scale-95">
            ← الرئيسية
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-full bg-gold-soft flex items-center justify-center">
            <HeartPulse className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              مؤشر صحتك <span className="gold-text">المالية</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              قيّم وضعك في 30 ثانية واحصل على نصائح مخصّصة
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-4 glass space-y-3 mb-5">
          <Field label="الراتب الشهري" value={salary} onChange={setSalary} placeholder="80000" />
          <Field label="الديون الشهرية (أقساط، قروض...)" value={debts} onChange={setDebts} placeholder="15000" />
          <Field label="المصاريف الشهرية (إيجار، طعام، فواتير...)" value={expenses} onChange={setExpenses} placeholder="40000" />
        </div>

        {result ? (
          <>
            <div className="rounded-2xl p-5 glass mb-4">
              <Gauge score={result.score} color={result.color} />
              <div className="mt-4 text-center">
                <div
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${result.color} 18%, transparent)`,
                    color: result.color,
                  }}
                >
                  {result.tierLabel}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <Mini label="ديون" value={`${Math.round(result.debtRatio * 100)}%`} />
                <Mini label="مصاريف" value={`${Math.round(result.expenseRatio * 100)}%`} />
                <Mini label="توفير" value={`${Math.round(result.savingsRatio * 100)}%`} />
              </div>

              <div className="mt-4 text-center text-[11px] text-muted-foreground">
                المتاح للتوفير شهرياً:{" "}
                <span className="font-display font-bold gold-text">
                  {formatDA(Math.max(0, (Number(salary) || 0) - (Number(debts) || 0) - (Number(expenses) || 0)))}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-sm flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-gold" />
                نصائح مخصّصة لك
              </h2>
              {result.tips.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 glass flex items-start gap-2.5"
                  style={{ borderRight: `3px solid var(--gold)` }}
                >
                  <span className="font-display font-extrabold gold-text text-sm leading-none mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[12.5px] leading-relaxed flex-1">{t}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl p-6 glass text-center text-sm text-muted-foreground">
            أدخل راتبك الشهري لبدء التقييم.
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface/40 p-2.5 text-center">
      <div className="font-display font-bold text-base">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

// Re-export for the home card
export { computeHealth };
