import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, X, Calculator } from "lucide-react";
import { BankLogo } from "@/components/BankLogo";
import { BANKS, formatDA, LOAN_TYPES, monthlyPayment } from "@/lib/banks";
import { useInputs, setInputs } from "@/lib/store";

export const Route = createFileRoute("/bank/$bankId")({
  component: BankDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center p-6">
      <div>
        <p className="mb-4">البنك غير موجود</p>
        <Link to="/compare" className="gold-text underline">العودة للمقارنة</Link>
      </div>
    </div>
  ),
  loader: ({ params }) => {
    const bank = BANKS.find((b) => b.id === params.bankId);
    if (!bank) throw notFound();
    return { bank };
  },
});

function BankDetail() {
  const { bank } = Route.useLoaderData();
  const [inputs] = useInputs();
  const product = bank.products.find((p) => p.loanType === inputs.loanType) ?? bank.products[0];
  const loanLabel = LOAN_TYPES.find((l) => l.id === product.loanType)?.label;
  const monthly = monthlyPayment(inputs.amount, product.rate, inputs.years);

  const goSimulator = () => {
    setInputs({ rate: product.rate, bankId: bank.id });
  };

  return (
    <div className="mx-auto max-w-md min-h-screen pb-10">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/compare" className="h-10 w-10 rounded-full glass flex items-center justify-center" aria-label="رجوع">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div className="text-sm text-muted-foreground">تفاصيل البنك</div>
      </div>

      <div className="px-5">
        {/* Header card */}
        <div className="glass rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <BankLogo short={bank.short} />
            <div className="flex-1">
              <h1 className="font-display text-xl font-extrabold">{bank.nameAr}</h1>
              <div className="text-xs text-muted-foreground">{bank.name}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="نوع القرض" value={loanLabel ?? ""} />
            <Stat label="الفائدة" value={`${product.rate}%`} highlight />
            <Stat label="أقصى مدة" value={`${product.maxYears} سنة`} />
          </div>
        </div>

        {/* Estimate */}
        <div className="rounded-3xl p-5 mb-4 gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]">
          <div className="text-xs font-semibold opacity-80 mb-1">القسط الشهري التقديري</div>
          <div className="font-display text-3xl font-extrabold">{formatDA(monthly)}</div>
          <div className="text-xs mt-2 opacity-80">
            على {inputs.years} سنة لمبلغ {formatDA(inputs.amount)}
          </div>
        </div>

        {/* Conditions */}
        <Section title="الشروط">
          <Row label="الحد الأدنى للراتب" value={formatDA(product.minSalary)} />
          <Row label="الحد الأقصى للمبلغ" value={formatDA(product.maxAmount)} />
          <Row label="السن المسموح" value={`${bank.minAge} - ${bank.maxAge} سنة`} />
          <Row label="الفائدة السنوية" value={`${product.rate}%`} />
        </Section>

        <Section title="المزايا">
          <ul className="space-y-2">
            {bank.pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3" style={{ color: "var(--success)" }} />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="السلبيات">
          <ul className="space-y-2">
            {bank.cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="h-3 w-3 text-destructive" />
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Link
          to="/simulator"
          onClick={goSimulator}
          className="mt-2 w-full py-4 rounded-2xl glass border-2 border-gold flex items-center justify-center gap-2 font-bold gold-text active:scale-[0.98] transition-transform"
        >
          <Calculator className="h-5 w-5" />
          محاكاة بهذا المعدل
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-surface/50 p-3 text-center">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className={`font-bold text-sm ${highlight ? "gold-text" : ""}`}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 mb-4">
      <h2 className="font-display font-bold text-base mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
