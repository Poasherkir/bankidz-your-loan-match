import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { GUIDE_CATEGORIES } from "@/lib/guide";

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

        <div className="mt-6 glass rounded-2xl p-4 text-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            المعلومات المعروضة هنا للاطلاع فقط. يرجى التأكد من الشروط الرسمية لدى البنوك والوكالات المعنية.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
