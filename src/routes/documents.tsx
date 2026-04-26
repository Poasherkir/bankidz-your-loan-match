import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { DOCUMENTS, LOAN_TYPES, type LoanType } from "@/lib/banks";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const [type, setType] = useState<LoanType>("real_estate");
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const docs = DOCUMENTS[type];
  const completed = docs.filter((d) => checked[`${type}:${d}`]).length;
  const selected = LOAN_TYPES.find((l) => l.id === type)!;

  const toggle = (d: string) => setChecked((c) => ({ ...c, [`${type}:${d}`]: !c[`${type}:${d}`] }));

  const copyList = async () => {
    const text = `📋 الوثائق المطلوبة - ${selected.label}\n\n` + docs.map((d, i) => `${i + 1}. ${d}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <PageShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl font-extrabold">الوثائق المطلوبة</h1>
        <p className="text-sm text-muted-foreground mt-1">تحقّق من كل الوثائق قبل التوجّه إلى البنك</p>
      </div>

      <div className="px-5">
        {/* Dropdown */}
        <div className="relative mb-4">
          <button
            onClick={() => setOpen(!open)}
            className="w-full glass rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selected.emoji}</span>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">نوع القرض</div>
                <div className="font-bold text-sm">{selected.label}</div>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute top-full mt-2 inset-x-0 glass rounded-2xl overflow-hidden z-10">
              {LOAN_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setType(t.id); setOpen(false); }}
                  className={`w-full p-3 flex items-center gap-3 text-right hover:bg-gold-soft transition-colors ${
                    t.id === type ? "bg-gold-soft" : ""
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-sm font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">التقدّم</div>
            <div className="font-display font-bold text-lg">
              <span className="gold-text">{completed}</span> / {docs.length}
            </div>
          </div>
          <div className="w-24 h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full gradient-gold transition-all"
              style={{ width: `${(completed / docs.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 mb-4">
          {docs.map((d) => {
            const isChecked = !!checked[`${type}:${d}`];
            return (
              <button
                key={d}
                onClick={() => toggle(d)}
                className={`w-full glass rounded-2xl p-4 flex items-center gap-3 text-right transition-all active:scale-[0.99] ${
                  isChecked ? "border border-gold/40" : ""
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isChecked ? "bg-gold border-gold" : "border-border"
                  }`}
                >
                  {isChecked && <Check className="h-4 w-4 text-gold-foreground" />}
                </div>
                <span className={`text-sm flex-1 ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                  {d}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={copyList}
          className="w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform"
        >
          {copied ? <><Check className="h-5 w-5" /> تم النسخ!</> : <><Copy className="h-5 w-5" /> نسخ القائمة</>}
        </button>
      </div>
    </PageShell>
  );
}
