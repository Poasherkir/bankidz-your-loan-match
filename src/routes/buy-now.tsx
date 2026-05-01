import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { loadProfile, shouldIBuy } from "@/lib/profile";

export const Route = createFileRoute("/buy-now")({
  component: BuyNowPage,
});

function BuyNowPage() {
  const navigate = useNavigate();
  const profile = typeof window !== "undefined" ? loadProfile() : null;

  const [price, setPrice] = useState<number>(5_000_000);
  const [savings, setSavings] = useState<number>(1_000_000);
  const [salary, setSalary] = useState<number>(profile?.salary ?? 60_000);

  const result = useMemo(
    () =>
      shouldIBuy({
        price,
        savings,
        salary,
        debts: profile?.debts ?? 0,
        age: profile?.age ?? 35,
      }),
    [price, savings, salary, profile]
  );

  return (
    <PageShell>
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
            <ShoppingBag className="h-3 w-3" />
            أداة قرار سريعة
          </div>
          <h1 className="font-display text-2xl font-extrabold mb-1">هل أشتري الآن؟</h1>
          <p className="text-sm text-muted-foreground">
            أدخل بيانات الشراء واحصل على توصية فورية.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <NumberField label="سعر العقار / السيارة (دج)" value={price} onChange={setPrice} />
          <NumberField label="مدخراتك الحالية (دج)" value={savings} onChange={setSavings} />
          <NumberField label="الراتب الشهري (دج)" value={salary} onChange={setSalary} />
        </div>

        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: `color-mix(in oklab, ${result.color} 12%, var(--surface))`,
            border: `1px solid color-mix(in oklab, ${result.color} 40%, transparent)`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `color-mix(in oklab, ${result.color} 22%, transparent)` }}
            >
              {result.emoji}
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">التوصية</div>
              <div
                className="font-display font-extrabold text-xl"
                style={{ color: result.color }}
              >
                {result.label}
              </div>
            </div>
          </div>

          <ul className="space-y-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="text-[12px] leading-relaxed flex items-start gap-2">
                <span className="text-gold mt-1">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          هذه التوصية تقديرية وتعتمد على معدل فائدة 6.5% ومدة افتراضية حتى سن التقاعد.
        </p>
      </div>
    </PageShell>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, +e.target.value || 0))}
        className="w-full bg-surface/60 rounded-xl px-4 py-3 text-base font-bold"
        dir="ltr"
      />
    </div>
  );
}
