import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Wallet, CalendarCheck } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { BANKS, LOAN_TYPES } from "@/lib/banks";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center text-center gap-2">
      <div className="h-10 w-10 rounded-full bg-gold-soft flex items-center justify-center">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div className="font-display text-2xl font-bold gold-text">{value}</div>
      <div className="text-xs text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}

function HomePage() {
  return (
    <PageShell>
      <div className="px-5 pt-12 pb-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-12 w-12 rounded-2xl gradient-gold flex items-center justify-center shadow-[var(--shadow-gold)]">
            <span className="font-display font-extrabold text-gold-foreground text-lg">B</span>
          </div>
          <div>
            <div className="font-display text-xl font-extrabold tracking-tight">
              Banki<span className="gold-text">DZ</span>
            </div>
            <div className="text-[11px] text-muted-foreground">دليل القروض الجزائرية</div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden glass p-6 mb-6">
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-gold opacity-10 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-gold opacity-5 blur-3xl" />
          <div className="relative">
            <div className="text-xs gold-text font-medium mb-3">مرحبا بك 👋</div>
            <h1 className="font-display text-3xl font-extrabold leading-tight mb-3">
              اختر البنك
              <br />
              <span className="gold-text">المناسب لك</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              قارن العروض، احسب القسط الشهري، واكتشف أفضل قرض يناسب وضعك المالي بكل شفافية.
            </p>
            <Link
              to="/onboarding"
              className="group inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-bold text-base shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform"
            >
              ابدأ الآن
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard icon={Building2} value={`${BANKS.length}+`} label="بنك جزائري" />
          <StatCard icon={Wallet} value={`${LOAN_TYPES.length}`} label="أنواع القروض" />
          <StatCard icon={CalendarCheck} value="2026" label="بيانات محدّثة" />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-bold mb-3 text-muted-foreground">استكشف</h2>
          <div className="grid grid-cols-2 gap-3">
            {LOAN_TYPES.map((t) => (
              <Link
                key={t.id}
                to="/onboarding"
                className="glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-semibold">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
