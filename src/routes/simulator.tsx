import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Loader2, Share2, Check } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { BANKS, formatDA, monthlyPayment } from "@/lib/banks";
import { useInputs } from "@/lib/store";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
});

function SimulatorPage() {
  const [inputs, setInputs] = useInputs();
  const [exporting, setExporting] = useState(false);
  const [shared, setShared] = useState(false);
  const rate = inputs.rate ?? 6.5;
  const monthly = monthlyPayment(inputs.amount, rate, inputs.years);
  const total = monthly * inputs.years * 12;
  const interest = total - inputs.amount;

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { generateReport } = await import("@/lib/pdf-report");
      generateReport({ ...inputs, rate });
    } finally {
      setExporting(false);
    }
  };

  const shareResult = async () => {
    const text = `محاكاة قرض BankiDZ\n\nالمبلغ: ${formatDA(inputs.amount)}\nالمدة: ${inputs.years} سنة\nالفائدة: ${rate}%\n\nالقسط الشهري: ${formatDA(monthly)}\nإجمالي السداد: ${formatDA(total)}\nإجمالي الفوائد: ${formatDA(interest)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "محاكاة قرض BankiDZ", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <PageShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl font-extrabold">محاكي القرض</h1>
        <p className="text-sm text-muted-foreground mt-1">احسب القسط الشهري وإجمالي السداد</p>
      </div>

      <div className="px-5 space-y-5">
        {/* Amount */}
        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-semibold mb-2">المبلغ المطلوب</label>
          <input
            type="number"
            inputMode="numeric"
            value={inputs.amount}
            onChange={(e) => setInputs({ amount: Number(e.target.value) || 0 })}
            className="w-full bg-transparent text-2xl font-bold gold-text font-display focus:outline-none"
          />
          <div className="text-xs text-muted-foreground mt-1">{formatDA(inputs.amount)}</div>
        </div>

        {/* Duration */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-sm font-semibold">مدة القرض</label>
            <span className="font-display text-xl font-bold gold-text">{inputs.years} سنة</span>
          </div>
          <input
            type="range"
            min={1}
            max={25}
            value={inputs.years}
            onChange={(e) => setInputs({ years: Number(e.target.value) })}
            dir="ltr"
            className="w-full accent-[var(--gold)]"
          />
          <div dir="ltr" className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1</span><span>25</span>
          </div>
        </div>

        {/* Rate */}
        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-semibold mb-2">معدل الفائدة السنوي (%)</label>
          <input
            type="number"
            step={0.1}
            inputMode="decimal"
            value={rate}
            onChange={(e) => setInputs({ rate: Number(e.target.value) || 0 })}
            className="w-full bg-transparent text-2xl font-bold font-display focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground self-center">من بنك:</span>
            {BANKS.slice(0, 4).map((b) => {
              const p = b.products.find((x) => x.loanType === inputs.loanType);
              if (!p) return null;
              return (
                <button
                  key={b.id}
                  onClick={() => setInputs({ rate: p.rate, bankId: b.id })}
                  className={`text-[11px] px-2.5 py-1 rounded-full border ${
                    inputs.bankId === b.id ? "border-gold bg-gold-soft gold-text" : "border-border"
                  }`}
                >
                  {b.short} {p.rate}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-3xl gradient-gold text-gold-foreground p-5 shadow-[var(--shadow-gold)]">
          <div className="text-xs font-semibold opacity-80 mb-1">القسط الشهري</div>
          <div className="font-display text-4xl font-extrabold mb-4">{formatDA(monthly)}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/10 p-3">
              <div className="text-[10px] opacity-80 mb-1">إجمالي السداد</div>
              <div className="font-bold text-sm">{formatDA(total)}</div>
            </div>
            <div className="rounded-xl bg-black/10 p-3">
              <div className="text-[10px] opacity-80 mb-1">إجمالي الفوائد</div>
              <div className="font-bold text-sm">{formatDA(interest)}</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-2">
          هذه الأرقام تقديرية فقط، يرجى مراجعة البنك للحصول على عرض رسمي
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={shareResult}
            className="py-4 rounded-2xl glass border-2 border-border flex items-center justify-center gap-2 font-bold text-sm active:scale-[0.98] transition-transform"
          >
            {shared ? (
              <><Check className="h-5 w-5 text-gold" /> تم النسخ</>
            ) : (
              <><Share2 className="h-5 w-5" /> مشاركة</>
            )}
          </button>
          <button
            onClick={exportPdf}
            disabled={exporting}
            className="py-4 rounded-2xl glass border-2 border-gold flex items-center justify-center gap-2 font-bold text-sm gold-text active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {exporting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> ...</>
            ) : (
              <><Download className="h-5 w-5" /> PDF</>
            )}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
