import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { LOAN_TYPES, type LoanType, formatDA } from "@/lib/banks";
import { useInputs } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useInputs();
  const [step, setStep] = useState(1);
  const total = 3;
  const progress = (step / total) * 100;

  const next = () => {
    if (step < total) setStep(step + 1);
    else navigate({ to: "/compare" });
  };
  const back = () => {
    if (step > 1) setStep(step - 1);
    else navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-md min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={back} className="h-10 w-10 rounded-full glass flex items-center justify-center" aria-label="رجوع">
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="text-xs text-muted-foreground">
            خطوة <span className="gold-text font-bold">{step}</span> من {total}
          </div>
          <Link to="/" className="h-10 w-10 rounded-full glass flex items-center justify-center" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full gradient-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4">
        {step === 1 && <Step1 value={inputs.loanType} onChange={(v) => setInputs({ loanType: v })} />}
        {step === 2 && (
          <Step2
            salary={inputs.salary}
            age={inputs.age}
            onChange={(p) => setInputs(p)}
          />
        )}
        {step === 3 && (
          <Step3
            years={inputs.years}
            amount={inputs.amount}
            onChange={(p) => setInputs(p)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform"
        >
          {step === total ? "اعرض النتائج" : "التالي"}
          <ArrowLeft className="h-5 w-5 rotate-180" />
        </button>
      </div>
    </div>
  );
}

function Step1({ value, onChange }: { value: LoanType; onChange: (v: LoanType) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold mb-2">ما الذي تريده؟</h2>
      <p className="text-sm text-muted-foreground mb-6">اختر نوع القرض المناسب لمشروعك</p>
      <div className="grid grid-cols-2 gap-3">
        {LOAN_TYPES.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`p-5 rounded-2xl border-2 text-right transition-all active:scale-[0.97] ${
                active
                  ? "border-gold bg-gold-soft shadow-[var(--shadow-gold)]"
                  : "border-border glass"
              }`}
            >
              <div className="text-3xl mb-3">{t.emoji}</div>
              <div className={`font-bold text-sm ${active ? "gold-text" : ""}`}>{t.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumField({
  label, value, onChange, suffix, min, max,
}: { label: string; value: number; onChange: (n: number) => void; suffix?: string; min?: number; max?: number }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-2">{label}</div>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full glass rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {suffix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function Step2({ salary, age, onChange }: { salary: number; age: number; onChange: (p: { salary?: number; age?: number }) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold mb-2">معلوماتك</h2>
        <p className="text-sm text-muted-foreground mb-6">سنستعملها لحساب أهليّتك للقرض</p>
      </div>
      <NumField label="الراتب الشهري الصافي" value={salary} onChange={(n) => onChange({ salary: n })} suffix="دج" min={0} />
      <NumField label="العمر" value={age} onChange={(n) => onChange({ age: n })} suffix="سنة" min={18} max={75} />
      <div className="glass rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
        💡 معلوماتك تُستعمل محليًا فقط ولا تُرسَل إلى أي خادم.
      </div>
    </div>
  );
}

function Step3({ years, amount, onChange }: { years: number; amount: number; onChange: (p: { years?: number; amount?: number }) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold mb-2">تفاصيل القرض</h2>
        <p className="text-sm text-muted-foreground mb-4">حدّد المبلغ والمدة</p>
      </div>
      <NumField label="المبلغ المطلوب" value={amount} onChange={(n) => onChange({ amount: n })} suffix="دج" min={0} />
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm font-semibold">مدة القرض</div>
          <div className="font-display text-2xl font-bold gold-text">{years} <span className="text-sm font-normal text-muted-foreground">سنة</span></div>
        </div>
        <input
          type="range"
          min={1}
          max={25}
          value={years}
          onChange={(e) => onChange({ years: Number(e.target.value) })}
          className="w-full accent-[var(--gold)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>1 سنة</span>
          <span>25 سنة</span>
        </div>
      </div>
      <div className="glass rounded-2xl p-4">
        <div className="text-xs text-muted-foreground mb-1">المبلغ المطلوب</div>
        <div className="font-display text-xl font-bold gold-text">{formatDA(amount)}</div>
      </div>
    </div>
  );
}
