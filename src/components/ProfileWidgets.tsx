import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Lightbulb, Wallet, Sparkles, ChevronLeft } from "lucide-react";
import { useProfile, computeMetrics } from "@/lib/profile";
import { formatDA } from "@/lib/banks";

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const size = 96;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke="var(--surface)"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-extrabold text-2xl" style={{ color }}>
          {score}
        </div>
        <div className="text-[9px] text-muted-foreground">من 100</div>
      </div>
    </div>
  );
}

export function ProfileSetupCta() {
  return (
    <Link
      to="/profile-setup"
      className="block rounded-2xl p-4 glass border border-gold/30 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gold-soft flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm">أنشئ ملفك المالي</div>
          <div className="text-[11px] text-muted-foreground">
            خصّص النصائح وتعرّف على قدرتك على الاقتراض
          </div>
        </div>
        <ChevronLeft className="h-4 w-4 text-gold" />
      </div>
    </Link>
  );
}

export function ProfileDashboard() {
  const [profile] = useProfile();
  if (!profile) return <ProfileSetupCta />;

  const m = computeMetrics(profile);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 glass">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gold" />
            ملفي المالي
          </h2>
          <Link to="/profile-setup" className="text-[11px] text-gold active:scale-95">
            تعديل
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ScoreGauge score={m.score} color={m.tierColor} />
          <div className="flex-1 min-w-0">
            <div
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold mb-2"
              style={{ backgroundColor: `color-mix(in oklab, ${m.tierColor} 18%, transparent)`, color: m.tierColor }}
            >
              {m.tierLabel}
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="text-[10px] text-muted-foreground">قدرتك على الاقتراض</div>
                <div className="font-display font-extrabold text-base gold-text leading-tight">
                  {formatDA(m.borrowingPower)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">القسط الأقصى المسموح</div>
                <div className="font-display font-bold text-sm leading-tight">
                  {formatDA(m.maxMonthly)} / شهر
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart warnings */}
      <div className="space-y-2">
        {m.warnings.map((w, i) => {
          const cfg =
            w.type === "warn"
              ? { Icon: AlertTriangle, color: "var(--destructive)" }
              : w.type === "ok"
              ? { Icon: CheckCircle2, color: "var(--success)" }
              : { Icon: Lightbulb, color: "var(--gold)" };
          const Icon = cfg.Icon;
          return (
            <div
              key={i}
              className="rounded-xl p-3 flex items-start gap-2.5 glass"
              style={{
                borderLeft: `3px solid ${cfg.color}`,
              }}
            >
              <Icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <p className="text-[12px] leading-relaxed">{w.text}</p>
            </div>
          );
        })}
      </div>

      <Link
        to="/buy-now"
        className="block rounded-2xl p-4 gradient-gold text-gold-foreground shadow-[var(--shadow-gold)] active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display font-extrabold text-sm">هل أشتري الآن؟ 🤔</div>
            <div className="text-[11px] opacity-80 mt-0.5">أداة قرار سريعة للسكن أو السيارة</div>
          </div>
          <ChevronLeft className="h-5 w-5" />
        </div>
      </Link>
    </div>
  );
}
