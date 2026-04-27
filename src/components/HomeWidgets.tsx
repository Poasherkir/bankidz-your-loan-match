import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, TrendingUp } from "lucide-react";
import { FX_RATES, TIPS, type Currency } from "@/lib/finance-data";

const FLAGS: Record<Currency, string> = { EUR: "🇪🇺", USD: "🇺🇸", GBP: "🇬🇧" };

export function CurrencyWidget() {
  const [from, setFrom] = useState<Currency>("EUR");
  const [amount, setAmount] = useState<number>(100);
  const [direction, setDirection] = useState<"toDZD" | "fromDZD">("toDZD");

  const result = useMemo(() => {
    if (direction === "toDZD") return amount * FX_RATES[from];
    return amount / FX_RATES[from];
  }, [amount, from, direction]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold" />
          أسعار الصرف
        </h2>
        <span className="text-[10px] text-muted-foreground">آخر تحديث: اليوم</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {(Object.keys(FX_RATES) as Currency[]).map((c) => (
          <button
            key={c}
            onClick={() => setFrom(c)}
            className={`rounded-xl p-2 text-center transition-all ${
              from === c ? "bg-gold-soft border border-gold/40" : "bg-surface/50"
            }`}
          >
            <div className="text-base">{FLAGS[c]}</div>
            <div className="text-[10px] font-bold">{c}</div>
            <div className="text-[11px] gold-text font-bold">{FX_RATES[c]}</div>
          </button>
        ))}
      </div>

      <div className="bg-surface/50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">محوّل سريع</span>
          <button
            onClick={() => setDirection((d) => (d === "toDZD" ? "fromDZD" : "toDZD"))}
            className="flex items-center gap-1 text-[11px] text-gold active:scale-95"
          >
            <ArrowLeftRight className="h-3 w-3" />
            عكس
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
            className="flex-1 bg-background/60 rounded-lg px-3 py-2 text-sm font-bold w-0"
            dir="ltr"
          />
          <span className="text-xs font-bold text-muted-foreground">
            {direction === "toDZD" ? from : "DZD"}
          </span>
        </div>
        <div className="mt-2 text-center">
          <div className="text-[10px] text-muted-foreground">يساوي</div>
          <div className="font-display font-extrabold gold-text text-lg">
            {fmt(result)} {direction === "toDZD" ? "DZD" : from}
          </div>
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = "bankidz:tip-dismissed-date";

export function TipCard() {
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  if (dismissed === today) return null;

  // Pick tip based on day of year so it rotates daily
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const tip = TIPS[day % TIPS.length];

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, today);
    } catch {
      /* ignore */
    }
    setDismissed(today);
  };

  return (
    <div className="relative rounded-2xl p-4 gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]">
      <button
        onClick={dismiss}
        aria-label="إخفاء"
        className="absolute top-2 left-2 h-7 w-7 rounded-full bg-black/10 active:bg-black/20 flex items-center justify-center text-xs font-bold"
      >
        ✕
      </button>
      <div className="text-[11px] font-bold opacity-80 mb-1">💡 نصيحة اليوم</div>
      <p className="text-sm font-semibold leading-relaxed pr-6">{tip}</p>
    </div>
  );
}
