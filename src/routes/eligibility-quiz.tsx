import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, ClipboardCheck, RotateCcw, ChevronLeft } from "lucide-react";
import { PageShell } from "@/components/BottomNav";

export const Route = createFileRoute("/eligibility-quiz")({
  component: QuizPage,
});

interface Question {
  id: string;
  text: string;
  hint: string;
  // "yes" answer scores this many points (negative = penalty)
  yesScore: number;
  noScore: number;
}

const QUESTIONS: Question[] = [
  {
    id: "employment",
    text: "هل لديك عمل ثابت منذ أكثر من سنة؟",
    hint: "العقد الدائم (CDI) أو وظيفة حكومية يعزّز قبولك.",
    yesScore: 25,
    noScore: 0,
  },
  {
    id: "salary",
    text: "هل راتبك ثابت ويُحوَّل بنكياً كل شهر؟",
    hint: "البنوك تطلب 3 كشوف راتب على الأقل.",
    yesScore: 20,
    noScore: 0,
  },
  {
    id: "debts",
    text: "هل ديونك الشهرية الحالية أقل من 20% من راتبك؟",
    hint: "الحد الأقصى المسموح به مع القرض الجديد هو 40%.",
    yesScore: 20,
    noScore: -5,
  },
  {
    id: "age",
    text: "هل عمرك بين 21 و 55 سنة؟",
    hint: "أغلب البنوك تشترط انتهاء القرض قبل سن 60–65.",
    yesScore: 20,
    noScore: 0,
  },
  {
    id: "residency",
    text: "هل أنت مقيم في الجزائر وتمتلك إقامة ثابتة؟",
    hint: "إثبات السكن (فاتورة كهرباء/ماء) مطلوب.",
    yesScore: 15,
    noScore: 0,
  },
];

type Answer = "yes" | "no";

interface Verdict {
  level: "green" | "yellow" | "red";
  title: string;
  emoji: string;
  color: string;
  summary: string;
  tips: string[];
}

function buildVerdict(score: number, answers: Record<string, Answer>): Verdict {
  const tips: string[] = [];
  if (answers.employment === "no")
    tips.push("اشتغل في وظيفة ثابتة لمدة سنة على الأقل قبل التقديم.");
  if (answers.salary === "no")
    tips.push("اطلب تحويل راتبك بنكياً لتوفير 3 كشوف على الأقل.");
  if (answers.debts === "no")
    tips.push("سدّد جزءاً من ديونك الحالية لخفض النسبة تحت 20%.");
  if (answers.age === "no")
    tips.push("إذا كنت قريباً من سن التقاعد، اختر قرضاً قصير المدة أو ضامناً.");
  if (answers.residency === "no")
    tips.push("جهّز وثيقة إقامة سارية وفاتورة باسمك أو باسم ولي الأمر.");

  if (score >= 80) {
    if (tips.length === 0)
      tips.push("جهّز ملفك الكامل وقارن العروض في تبويب «قارن».");
    return {
      level: "green",
      title: "أنت مؤهل للحصول على قرض",
      emoji: "✅",
      color: "var(--success)",
      summary:
        "وضعك ممتاز! معظم البنوك الجزائرية ستقبل ملفك بسهولة. ابدأ بمقارنة العروض واختر الأنسب.",
      tips,
    };
  }
  if (score >= 50) {
    tips.push("راجع شروط كل بنك بدقة وفكّر في إضافة ضامن لتعزيز ملفك.");
    return {
      level: "yellow",
      title: "أنت مؤهل بشروط",
      emoji: "⚠️",
      color: "var(--gold)",
      summary:
        "ملفك مقبول لكن قد تواجه شروطاً إضافية أو فوائد أعلى. حسّن النقاط الضعيفة قبل التقديم.",
      tips,
    };
  }
  tips.push("أنشئ ملفك المالي في التطبيق لمتابعة تحسّن مؤشراتك شهرياً.");
  return {
    level: "red",
    title: "ننصح بتحسين وضعك المالي أولاً",
    emoji: "❌",
    color: "var(--destructive)",
    summary:
      "وضعك الحالي يجعل قبول القرض صعباً. اشتغل على النقاط أدناه لمدة 3–6 أشهر ثم أعد التقييم.",
    tips,
  };
}

function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const progress = done ? 100 : Math.round((step / total) * 100);

  function answer(a: Answer) {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    if (step + 1 >= total) {
      setDone(true);
    } else {
      setStep(step + 1);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setDone(false);
  }

  const score = QUESTIONS.reduce((acc, q) => {
    const a = answers[q.id];
    if (a === "yes") return acc + q.yesScore;
    if (a === "no") return acc + q.noScore;
    return acc;
  }, 0);
  const clampedScore = Math.max(0, Math.min(100, score));
  const verdict = done ? buildVerdict(clampedScore, answers) : null;

  return (
    <PageShell>
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/" className="text-[12px] text-muted-foreground active:scale-95">
            ← الرئيسية
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-full bg-gold-soft flex items-center justify-center">
            <ClipboardCheck className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              اختبار <span className="gold-text">الأهلية</span> السريع
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              5 أسئلة فقط لمعرفة فرصك في الحصول على قرض
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>{done ? "اكتمل" : `سؤال ${step + 1} من ${total}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full gradient-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!done && (
          <div className="rounded-2xl p-5 glass">
            <div className="text-[11px] gold-text font-medium mb-2">
              السؤال {step + 1}
            </div>
            <h2 className="font-display font-extrabold text-xl leading-snug mb-2">
              {QUESTIONS[step].text}
            </h2>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-5">
              💡 {QUESTIONS[step].hint}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer("yes")}
                className="h-14 rounded-2xl gradient-gold text-gold-foreground font-display font-bold text-base shadow-[var(--shadow-gold)] active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                نعم
              </button>
              <button
                type="button"
                onClick={() => answer("no")}
                className="h-14 rounded-2xl glass font-display font-bold text-base active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
                لا
              </button>
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="mt-4 text-[12px] text-muted-foreground active:scale-95"
              >
                ← السؤال السابق
              </button>
            )}
          </div>
        )}

        {done && verdict && (
          <>
            <div
              className="rounded-2xl p-5 glass mb-4"
              style={{ borderTop: `4px solid ${verdict.color}` }}
            >
              <div className="text-center">
                <div className="text-5xl mb-2">{verdict.emoji}</div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${verdict.color} 18%, transparent)`,
                    color: verdict.color,
                  }}
                >
                  النتيجة: {clampedScore}/100
                </div>
                <h2
                  className="font-display font-extrabold text-xl leading-tight mb-2"
                  style={{ color: verdict.color }}
                >
                  {verdict.title}
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {verdict.summary}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <h3 className="font-display font-bold text-sm mb-1">خطوات لتحسين ملفك</h3>
              {verdict.tips.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 glass flex items-start gap-2.5"
                  style={{ borderRight: `3px solid ${verdict.color}` }}
                >
                  <span
                    className="font-display font-extrabold text-sm leading-none mt-0.5"
                    style={{ color: verdict.color }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[12.5px] leading-relaxed flex-1">{t}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={reset}
                className="h-12 rounded-2xl glass font-bold text-sm active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                إعادة الاختبار
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/onboarding" })}
                className="h-12 rounded-2xl gradient-gold text-gold-foreground font-bold text-sm shadow-[var(--shadow-gold)] active:scale-[0.97] flex items-center justify-center gap-2"
              >
                قارن البنوك
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
