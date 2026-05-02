import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Calculator, FileText } from "lucide-react";

export const WELCOME_KEY = "bankidz.welcome.seen.v1";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
});

const SLIDES = [
  {
    icon: Building2,
    title: "قارن البنوك الجزائرية بسهولة",
    desc: "اكتشف عروض القروض من أهم البنوك الجزائرية في مكان واحد.",
    illustration: "banks",
  },
  {
    icon: Calculator,
    title: "احسب قسطك الشهري قبل التوجه للبنك",
    desc: "محاكي ذكي يحسب لك القسط والفائدة والمدة بدقة.",
    illustration: "calc",
  },
  {
    icon: FileText,
    title: "تعرّف على الوثائق المطلوبة",
    desc: "قائمة كاملة بكل الوثائق التي يطلبها البنك حسب نوع القرض.",
    illustration: "docs",
  },
] as const;

function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const total = SLIDES.length;

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(WELCOME_KEY) === "1") {
      navigate({ to: "/", replace: true });
    }
  }, [navigate]);

  const finish = () => {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch {}
    navigate({ to: "/", replace: true });
  };

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else finish();
  };

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="mx-auto max-w-md min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="px-5 pt-6 flex items-center justify-between">
        <div className="font-display text-lg font-extrabold">
          Banki<span className="gold-text">DZ</span>
        </div>
        <button
          onClick={finish}
          className="text-sm text-muted-foreground active:opacity-70"
        >
          تخطي
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative mb-10">
          <div className="absolute inset-0 rounded-full bg-gold-soft blur-2xl opacity-60" />
          <div className="relative h-44 w-44 rounded-full glass flex items-center justify-center border-2 border-gold/30 shadow-[var(--shadow-gold)]">
            <Illustration kind={slide.illustration} />
          </div>
        </div>

        <div className="h-12 w-12 rounded-2xl gradient-gold flex items-center justify-center mb-5 shadow-[var(--shadow-gold)]">
          <Icon className="h-6 w-6 text-gold-foreground" />
        </div>

        <h1 className="font-display text-2xl font-extrabold text-center leading-tight mb-3">
          {slide.title}
        </h1>
        <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs">
          {slide.desc}
        </p>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step ? "w-6 gradient-gold" : "w-2 bg-surface"
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform"
        >
          {step === total - 1 ? "ابدأ الآن" : "التالي"}
          <ArrowLeft className="h-5 w-5 rotate-180" />
        </button>
      </div>
    </div>
  );
}

function Illustration({ kind }: { kind: string }) {
  if (kind === "banks") {
    return (
      <div className="flex items-end gap-2">
        <div className="h-16 w-8 rounded-md bg-primary/80 border-t-4 border-gold" />
        <div className="h-24 w-8 rounded-md bg-primary border-t-4 border-gold" />
        <div className="h-20 w-8 rounded-md bg-primary/90 border-t-4 border-gold" />
        <div className="h-14 w-8 rounded-md bg-primary/70 border-t-4 border-gold" />
      </div>
    );
  }
  if (kind === "calc") {
    return (
      <div className="h-24 w-20 rounded-xl bg-primary border-2 border-gold/50 p-2 flex flex-col gap-1">
        <div className="h-5 rounded bg-gold/30" />
        <div className="grid grid-cols-3 gap-1 flex-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded bg-gold/60" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="absolute -right-3 -top-2 h-24 w-18 rounded-md bg-primary/60 border border-gold/30 rotate-6" />
      <div className="relative h-24 w-18 rounded-md bg-primary border-2 border-gold/50 p-2 flex flex-col gap-1.5">
        <div className="h-1 rounded bg-gold/80 w-3/4" />
        <div className="h-1 rounded bg-gold/40 w-full" />
        <div className="h-1 rounded bg-gold/40 w-5/6" />
        <div className="h-1 rounded bg-gold/40 w-2/3" />
        <div className="h-1 rounded bg-gold/40 w-4/5" />
      </div>
    </div>
  );
}
