import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { GOALS, loadProfile, saveProfile, type FinancialGoal } from "@/lib/profile";

export const Route = createFileRoute("/profile-setup")({
  component: ProfileSetupPage,
});

function ProfileSetupPage() {
  const navigate = useNavigate();
  const existing = typeof window !== "undefined" ? loadProfile() : null;

  const [salary, setSalary] = useState<number>(existing?.salary ?? 60000);
  const [debts, setDebts] = useState<number>(existing?.debts ?? 0);
  const [goal, setGoal] = useState<FinancialGoal>(existing?.goal ?? "housing");
  const [age, setAge] = useState<number>(existing?.age ?? 30);

  const submit = () => {
    saveProfile({
      salary: Math.max(0, salary),
      debts: Math.max(0, debts),
      goal,
      age: Math.max(18, Math.min(70, age)),
      createdAt: existing?.createdAt ?? Date.now(),
    });
    navigate({ to: "/" });
  };

  return (
    <PageShell hideNav>
      <div className="px-5 pt-12 pb-8">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1 text-xs text-muted-foreground mb-6 active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
          رجوع
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-soft text-gold text-[11px] font-bold mb-3">
            <Sparkles className="h-3 w-3" />
            ملفي المالي
          </div>
          <h1 className="font-display text-2xl font-extrabold mb-1">إعداد سريع</h1>
          <p className="text-sm text-muted-foreground">
            هذه البيانات تبقى على جهازك فقط ولا تُرسَل لأي طرف.
          </p>
        </div>

        <div className="space-y-5">
          <Field label="الراتب الشهري (دج)">
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(+e.target.value || 0)}
              className="w-full bg-surface/60 rounded-xl px-4 py-3 text-base font-bold"
              dir="ltr"
            />
          </Field>

          <Field label="الديون / الأقساط الشهرية الحالية (دج)">
            <input
              type="number"
              value={debts}
              onChange={(e) => setDebts(+e.target.value || 0)}
              className="w-full bg-surface/60 rounded-xl px-4 py-3 text-base font-bold"
              dir="ltr"
            />
          </Field>

          <Field label="العمر">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(+e.target.value || 0)}
              className="w-full bg-surface/60 rounded-xl px-4 py-3 text-base font-bold"
              dir="ltr"
            />
          </Field>

          <Field label="هدفك المالي">
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`rounded-xl p-3 flex items-center gap-2 transition-all ${
                    goal === g.id
                      ? "bg-gold-soft border border-gold/50"
                      : "bg-surface/60 border border-transparent"
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-sm font-bold">{g.label}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          onClick={submit}
          className="mt-8 w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-bold text-base shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform"
        >
          حفظ الملف
        </button>
      </div>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}
