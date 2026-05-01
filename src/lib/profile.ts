// Personal Financial Profile — stored in localStorage
import { useEffect, useState } from "react";

export type FinancialGoal = "housing" | "car" | "business" | "savings";

export const GOALS: { id: FinancialGoal; label: string; emoji: string }[] = [
  { id: "housing", label: "سكن", emoji: "🏠" },
  { id: "car", label: "سيارة", emoji: "🚗" },
  { id: "business", label: "مشروع", emoji: "💼" },
  { id: "savings", label: "توفير", emoji: "💰" },
];

export interface FinancialProfile {
  salary: number;        // monthly salary (DZD)
  debts: number;         // current monthly debts (DZD)
  goal: FinancialGoal;
  age: number;
  createdAt: number;
}

const KEY = "bankidz:profile";

export function loadProfile(): FinancialProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FinancialProfile;
  } catch {
    return null;
  }
}

export function saveProfile(p: FinancialProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("profile:updated"));
  } catch {
    /* ignore */
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("profile:updated"));
  } catch {
    /* ignore */
  }
}

export function useProfile(): [FinancialProfile | null, (p: FinancialProfile) => void] {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  useEffect(() => {
    setProfile(loadProfile());
    const onUpdate = () => setProfile(loadProfile());
    window.addEventListener("profile:updated", onUpdate);
    return () => window.removeEventListener("profile:updated", onUpdate);
  }, []);
  const update = (p: FinancialProfile) => {
    saveProfile(p);
    setProfile(p);
  };
  return [profile, update];
}

// ---------- Calculations ----------

export interface ProfileMetrics {
  maxMonthly: number;       // 40% of salary minus current debts
  borrowingPower: number;   // present value of annuity at 6.5% over years left
  score: number;            // 0–100
  tier: "critical" | "average" | "excellent";
  tierLabel: string;
  tierColor: string;        // CSS var ref
  warnings: { type: "warn" | "ok" | "tip"; text: string }[];
}

export function computeMetrics(p: FinancialProfile, ratePct = 6.5): ProfileMetrics {
  const cap = p.salary * 0.4;
  const maxMonthly = Math.max(0, cap - p.debts);
  const yearsLeft = Math.max(1, Math.min(25, 60 - p.age));
  const months = yearsLeft * 12;
  const r = ratePct / 100 / 12;
  const borrowingPower =
    r === 0 ? maxMonthly * months : (maxMonthly * (1 - Math.pow(1 + r, -months))) / r;

  // Score: weighted blend
  // - debt ratio (lower better)
  // - savings capacity vs salary cap (higher better)
  // - age headroom (more years left = better)
  const debtRatio = p.salary > 0 ? Math.min(1, p.debts / p.salary) : 1; // 0 best
  const capacityRatio = cap > 0 ? Math.max(0, (cap - p.debts) / cap) : 0; // 1 best
  const ageRatio = yearsLeft / 25; // 1 best

  const raw =
    (1 - debtRatio) * 45 + // up to 45
    capacityRatio * 35 +   // up to 35
    ageRatio * 20;         // up to 20
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  let tier: ProfileMetrics["tier"];
  let tierLabel: string;
  let tierColor: string;
  if (score <= 40) {
    tier = "critical";
    tierLabel = "وضع حرج";
    tierColor = "var(--destructive)";
  } else if (score <= 70) {
    tier = "average";
    tierLabel = "وضع متوسط";
    tierColor = "var(--gold)";
  } else {
    tier = "excellent";
    tierLabel = "ممتاز";
    tierColor = "var(--success)";
  }

  const warnings: ProfileMetrics["warnings"] = [];
  const debtPct = p.salary > 0 ? (p.debts / p.salary) * 100 : 0;
  if (debtPct >= 50) {
    warnings.push({
      type: "warn",
      text: `ديونك الحالية تستهلك ${Math.round(debtPct)}% من راتبك — وضع خطر.`,
    });
  } else if (debtPct >= 30) {
    warnings.push({
      type: "warn",
      text: `ديونك تمثل ${Math.round(debtPct)}% من الراتب — قلّل قبل قرض جديد.`,
    });
  }

  if (tier === "excellent") {
    warnings.push({
      type: "ok",
      text: `وضعك المالي يؤهلك لقرض حتى ${formatShort(borrowingPower)}.`,
    });
  } else if (tier === "average") {
    warnings.push({
      type: "tip",
      text: "انتظر 6 أشهر بعد تقليل الديون لتحسين أهليتك بشكل ملحوظ.",
    });
  } else {
    warnings.push({
      type: "tip",
      text: "ركّز على تسديد الديون قبل التفكير في قرض جديد.",
    });
  }

  if (yearsLeft <= 10) {
    warnings.push({
      type: "tip",
      text: "السن المتبقي قبل التقاعد قصير، مما يقلل مدة القرض الممكنة.",
    });
  }

  return { maxMonthly, borrowingPower, score, tier, tierLabel, tierColor, warnings };
}

function formatShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} مليون دج`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} ألف دج`;
  return `${Math.round(n)} دج`;
}

// ---------- Quick decision ("هل أشتري الآن؟") ----------

export type Decision = "buy" | "wait" | "no";

export interface DecisionResult {
  decision: Decision;
  label: string;
  emoji: string;
  color: string;
  reasons: string[];
}

export function shouldIBuy(input: {
  price: number;
  savings: number;
  salary: number;
  debts?: number;
  age?: number;
}): DecisionResult {
  const { price, savings, salary } = input;
  const debts = input.debts ?? 0;
  const age = input.age ?? 35;

  const downPaymentPct = price > 0 ? savings / price : 0;
  const financed = Math.max(0, price - savings);
  const yearsLeft = Math.max(1, Math.min(25, 60 - age));
  const r = 6.5 / 100 / 12;
  const months = yearsLeft * 12;
  const monthly =
    financed === 0
      ? 0
      : (financed * r) / (1 - Math.pow(1 + r, -months));
  const cap = salary * 0.4 - debts;
  const burden = cap > 0 ? monthly / cap : 99;

  const reasons: string[] = [];
  reasons.push(`دفعة أولى: ${Math.round(downPaymentPct * 100)}% من السعر.`);
  if (financed > 0) {
    reasons.push(`القسط التقديري: ${formatShort(monthly)} على ${yearsLeft} سنة.`);
    reasons.push(
      `يمثّل ${Math.round((monthly / Math.max(1, salary)) * 100)}% من راتبك.`
    );
  }

  let decision: Decision;
  if (price <= 0 || salary <= 0) {
    decision = "no";
    reasons.push("أدخل بيانات صحيحة لإجراء التقييم.");
  } else if (downPaymentPct >= 0.4 && burden <= 0.8) {
    decision = "buy";
    reasons.push("لديك دفعة أولى قوية وقدرة سداد مريحة.");
  } else if (downPaymentPct >= 0.2 && burden <= 1) {
    decision = "wait";
    reasons.push("الوضع ممكن لكن من الأفضل ادخار 6–12 شهر إضافي.");
  } else {
    decision = "no";
    if (burden > 1) reasons.push("القسط يتجاوز حد الـ 40% من الراتب — مرفوض من البنوك.");
    if (downPaymentPct < 0.2) reasons.push("الدفعة الأولى ضعيفة جداً (أقل من 20%).");
  }

  if (decision === "buy") {
    return { decision, label: "اشترِ الآن", emoji: "✅", color: "var(--success)", reasons };
  }
  if (decision === "wait") {
    return { decision, label: "انتظر قليلاً", emoji: "⏳", color: "var(--gold)", reasons };
  }
  return { decision, label: "غير موصى به", emoji: "❌", color: "var(--destructive)", reasons };
}
