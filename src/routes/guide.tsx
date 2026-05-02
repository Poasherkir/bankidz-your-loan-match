import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronLeft, Sparkles, Scale } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { GUIDE_CATEGORIES } from "@/lib/guide";
import { FAQ } from "@/lib/finance-data";

export const Route = createFileRoute("/guide")({
  component: GuideIndex,
});

function GuideIndex() {
  return (
    <PageShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl font-extrabold">دليل البنوك</h1>
        <p className="text-sm text-muted-foreground mt-1">
          كل ما تحتاج معرفته حول الحسابات والقروض في الجزائر
        </p>
      </div>

      <div className="px-5">
        {/* Featured tool */}
        <Link
          to="/early-payoff"
          className="block relative overflow-hidden rounded-2xl p-4 mb-4 gradient-gold text-gold-foreground shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform"
        >
          <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display font-extrabold text-sm">حاسبة السداد المبكر</div>
              <div className="text-[11px] opacity-90 leading-tight">احسب كم ستوفّر بسداد جزء من قرضك مبكرًا</div>
            </div>
            <ChevronLeft className="h-5 w-5 opacity-80" />
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {GUIDE_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/guide/$category"
              params={{ category: c.id }}
              className="group glass rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.97] transition-transform relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </div>
              <div>
                <div className="font-display font-bold text-sm leading-tight mb-1">{c.title}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{c.subtitle}</div>
              </div>
              <div className="mt-auto pt-2">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gold-soft text-gold font-medium">
                  آخر تحديث: {c.updatedAt}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <h2 className="font-display text-lg font-extrabold mb-3">أسئلة شائعة</h2>
          <FaqAccordion />
        </div>

        <div className="mt-6 glass rounded-2xl p-4 text-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            المعلومات المعروضة هنا للاطلاع فقط. يرجى التأكد من الشروط الرسمية لدى البنوك والوكالات المعنية.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full p-4 flex items-center justify-between gap-3 text-right active:bg-gold-soft/40 transition-colors"
            >
              <span className="text-sm font-bold flex-1 leading-relaxed">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 text-gold shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 -mt-1 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
