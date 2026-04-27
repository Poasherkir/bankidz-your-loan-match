import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Download, FileText } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import {
  ACCOUNT_TYPES,
  BANK_CARDS,
  BARIDIMOB_STEPS,
  CARD_DOCUMENTS,
  GUIDE_CATEGORIES,
  HOUSING_PROGRAMS,
  PROFESSIONAL_PROGRAMS,
  SATIM_STEPS,
  STUDENT_LOAN,
  type GuideCategoryId,
} from "@/lib/guide";

const VALID: GuideCategoryId[] = [
  "account",
  "cards",
  "housing",
  "professional",
  "student",
  "schedule",
];

export const Route = createFileRoute("/guide/$category")({
  loader: ({ params }) => {
    if (!VALID.includes(params.category as GuideCategoryId)) throw notFound();
    return { category: params.category as GuideCategoryId };
  },
  component: GuideDetail,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-5 pt-12 text-center">
        <p className="text-muted-foreground mb-4">القسم غير موجود</p>
        <Link to="/guide" className="text-gold underline">
          العودة إلى الدليل
        </Link>
      </div>
    </PageShell>
  ),
});

function GuideDetail() {
  const { category } = Route.useLoaderData();
  const meta = GUIDE_CATEGORIES.find((c) => c.id === category)!;

  return (
    <PageShell>
      <div className="px-5 pt-8 pb-4">
        <Link
          to="/guide"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-4 active:text-gold"
        >
          <ArrowRight className="h-4 w-4" />
          الدليل
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{meta.emoji}</span>
          <h1 className="font-display text-2xl font-extrabold">{meta.title}</h1>
        </div>
        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gold-soft text-gold font-medium">
          آخر تحديث: {meta.updatedAt}
        </span>
      </div>

      <div className="px-5 pb-4">
        {category === "account" && <AccountSection />}
        {category === "cards" && <CardsSection />}
        {category === "housing" && <HousingSection />}
        {category === "professional" && <ProfessionalSection />}
        {category === "student" && <StudentSection />}
        {category === "schedule" && <ScheduleSection />}
      </div>
    </PageShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display font-bold text-base mb-2 mt-4">{children}</h2>;
}

function DocList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((d) => (
        <li key={d} className="flex items-start gap-2 text-sm">
          <FileText className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span className="leading-relaxed">{d}</span>
        </li>
      ))}
    </ul>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span className="h-6 w-6 rounded-full bg-gold text-gold-foreground font-bold text-xs flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span className="leading-relaxed flex-1 pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}

// --- 1. Account ---
function AccountSection() {
  const [active, setActive] = useState(ACCOUNT_TYPES[0].id);
  const sel = ACCOUNT_TYPES.find((a) => a.id === active)!;
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ACCOUNT_TYPES.map((a) => (
          <button
            key={a.id}
            onClick={() => setActive(a.id)}
            className={`glass rounded-2xl p-3 text-center transition-all ${
              active === a.id ? "border border-gold/60 bg-gold-soft" : ""
            }`}
          >
            <div className="text-2xl mb-1">{a.emoji}</div>
            <div className="text-[11px] font-bold leading-tight">{a.name}</div>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-sm text-muted-foreground mb-3">{sel.description}</p>
        <SectionTitle>📋 الوثائق المطلوبة</SectionTitle>
        <DocList items={sel.documents} />
        <SectionTitle>📝 خطوات الفتح</SectionTitle>
        <StepList items={sel.steps} />
      </div>
    </div>
  );
}

// --- 2. Cards ---
function CardsSection() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gold border-b border-border">
              <th className="text-right p-2 font-bold">البطاقة</th>
              <th className="text-right p-2 font-bold">الرسوم</th>
              <th className="text-right p-2 font-bold">الشبكة</th>
            </tr>
          </thead>
          <tbody>
            {BANK_CARDS.map((c) => (
              <tr key={c.name} className="border-b border-border/50 last:border-0">
                <td className="p-2 font-bold">{c.name}</td>
                <td className="p-2">{c.fees}</td>
                <td className="p-2">{c.network}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {BANK_CARDS.map((c) => (
        <div key={c.name} className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-base">{c.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-soft text-gold">
              {c.network}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{c.type}</p>
          <ul className="space-y-1">
            {c.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="glass rounded-2xl p-4">
        <SectionTitle>📋 الوثائق المطلوبة لطلب البطاقة</SectionTitle>
        <DocList items={CARD_DOCUMENTS} />
      </div>

      <div className="glass rounded-2xl p-4">
        <SectionTitle>📱 تفعيل BaridiMob</SectionTitle>
        <StepList items={BARIDIMOB_STEPS} />
      </div>

      <div className="glass rounded-2xl p-4">
        <SectionTitle>💻 تفعيل SATIM (الدفع الإلكتروني)</SectionTitle>
        <StepList items={SATIM_STEPS} />
      </div>
    </div>
  );
}

// --- 3. Housing ---
function HousingSection() {
  const [active, setActive] = useState(HOUSING_PROGRAMS[0].id);
  const sel = HOUSING_PROGRAMS.find((h) => h.id === active)!;
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {HOUSING_PROGRAMS.map((h) => (
          <button
            key={h.id}
            onClick={() => setActive(h.id)}
            className={`glass rounded-2xl p-3 text-center transition-all ${
              active === h.id ? "border border-gold/60 bg-gold-soft" : ""
            }`}
          >
            <div className="font-display font-extrabold text-sm gold-text">{h.name}</div>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-3">{sel.fullName}</p>
        <SectionTitle>✅ الشروط</SectionTitle>
        <div className="grid grid-cols-1 gap-2">
          {sel.conditions.map((c) => (
            <div key={c.label} className="flex items-center justify-between bg-surface/50 rounded-xl px-3 py-2">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <span className="text-sm font-bold">{c.value}</span>
            </div>
          ))}
        </div>
        <SectionTitle>📋 الوثائق</SectionTitle>
        <DocList items={sel.documents} />
        <SectionTitle>📝 خطوات التسجيل</SectionTitle>
        <StepList items={sel.steps} />
      </div>
    </div>
  );
}

// --- 4. Professional ---
function ProfessionalSection() {
  const [active, setActive] = useState(PROFESSIONAL_PROGRAMS[0].id);
  const sel = PROFESSIONAL_PROGRAMS.find((p) => p.id === active)!;
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PROFESSIONAL_PROGRAMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`glass rounded-2xl p-3 text-center transition-all ${
              active === p.id ? "border border-gold/60 bg-gold-soft" : ""
            }`}
          >
            <div className="font-display font-extrabold text-sm gold-text">{p.name}</div>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-3">{sel.fullName}</p>
        <div className="bg-gold-soft rounded-2xl p-3 mb-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">الحد الأقصى</span>
          <span className="font-display font-extrabold gold-text text-base">{sel.maxAmount}</span>
        </div>
        <SectionTitle>✅ الشروط</SectionTitle>
        <ul className="space-y-1.5">
          {sel.conditions.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
        <SectionTitle>📋 الوثائق</SectionTitle>
        <DocList items={sel.documents} />
        <SectionTitle>📝 الخطوات</SectionTitle>
        <StepList items={sel.steps} />
      </div>
    </div>
  );
}

// --- 5. Student ---
function StudentSection() {
  const s = STUDENT_LOAN;
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h2 className="font-display font-bold text-lg mb-1">{s.name}</h2>
        <p className="text-xs text-muted-foreground mb-3">{s.fullName}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gold-soft rounded-xl p-3">
            <div className="text-[10px] text-muted-foreground">المبلغ</div>
            <div className="font-display font-extrabold gold-text text-sm">{s.amount}</div>
          </div>
          <div className="bg-gold-soft rounded-xl p-3">
            <div className="text-[10px] text-muted-foreground">الفائدة</div>
            <div className="font-display font-extrabold gold-text text-sm">{s.rate}</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <SectionTitle>✅ الشروط</SectionTitle>
        <ul className="space-y-1.5">
          {s.conditions.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-2xl p-4">
        <SectionTitle>📋 الوثائق المطلوبة</SectionTitle>
        <DocList items={s.documents} />
      </div>

      <div className="glass rounded-2xl p-4">
        <SectionTitle>💰 شروط التسديد</SectionTitle>
        <StepList items={s.repayment} />
      </div>
    </div>
  );
}

// --- 6. Schedule ---
interface AmortRow {
  n: number;
  date: string;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

function buildSchedule(amount: number, years: number, ratePct: number): AmortRow[] {
  const months = years * 12;
  const r = ratePct / 100 / 12;
  const m = r === 0 ? amount / months : (amount * r) / (1 - Math.pow(1 + r, -months));
  const rows: AmortRow[] = [];
  let balance = amount;
  const start = new Date();
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const principal = m - interest;
    balance = Math.max(0, balance - principal);
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    rows.push({
      n: i,
      date: `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
      payment: m,
      interest,
      principal,
      balance,
    });
  }
  return rows;
}

function ScheduleSection() {
  const [amount, setAmount] = useState(2_000_000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(6.5);
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(() => buildSchedule(amount, years, rate), [amount, years, rate]);
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(Math.round(n));

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { generateSchedulePdf } = await import("@/lib/schedule-pdf");
      generateSchedulePdf({ amount, years, rate, rows });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">مبلغ القرض (دج)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
            className="w-full mt-1 bg-surface rounded-xl px-3 py-2 text-sm font-bold"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">المدة: {years} سنة</label>
          <input
            type="range"
            min={1}
            max={25}
            value={years}
            dir="ltr"
            onChange={(e) => setYears(+e.target.value)}
            className="w-full accent-[var(--gold)]"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">نسبة الفائدة: {rate}%</label>
          <input
            type="range"
            min={0}
            max={15}
            step={0.1}
            value={rate}
            dir="ltr"
            onChange={(e) => setRate(+e.target.value)}
            className="w-full accent-[var(--gold)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-2xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">القسط الشهري</div>
          <div className="font-display font-bold text-sm gold-text">{fmt(rows[0].payment)}</div>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">إجمالي الفائدة</div>
          <div className="font-display font-bold text-sm gold-text">
            {fmt(rows.reduce((s, r) => s + r.interest, 0))}
          </div>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">عدد الأقساط</div>
          <div className="font-display font-bold text-sm gold-text">{rows.length}</div>
        </div>
      </div>

      <button
        onClick={exportPdf}
        disabled={exporting}
        className="w-full py-3 rounded-2xl gradient-gold text-gold-foreground font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-gold)] active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        <Download className="h-5 w-5" />
        {exporting ? "جاري التصدير..." : "تصدير الجدول PDF"}
      </button>

      <div className="glass rounded-2xl p-2 overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="text-gold">
            <tr className="border-b border-border">
              <th className="p-2 text-right font-bold">#</th>
              <th className="p-2 text-right font-bold">التاريخ</th>
              <th className="p-2 text-right font-bold">القسط</th>
              <th className="p-2 text-right font-bold">الفائدة</th>
              <th className="p-2 text-right font-bold">الأصل</th>
              <th className="p-2 text-right font-bold">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} className="border-b border-border/40 last:border-0">
                <td className="p-2 font-bold gold-text">{r.n}</td>
                <td className="p-2">{r.date}</td>
                <td className="p-2">{fmt(r.payment)}</td>
                <td className="p-2 text-muted-foreground">{fmt(r.interest)}</td>
                <td className="p-2">{fmt(r.principal)}</td>
                <td className="p-2 font-bold">{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        هذه الأرقام تقديرية فقط، يرجى مراجعة البنك للحصول على عرض رسمي
      </p>
    </div>
  );
}
