export type LoanType = "real_estate" | "car" | "personal" | "student";

export const LOAN_TYPES: { id: LoanType; label: string; emoji: string }[] = [
  { id: "real_estate", label: "قرض عقاري", emoji: "🏠" },
  { id: "car", label: "قرض سيارة", emoji: "🚗" },
  { id: "personal", label: "قرض شخصي", emoji: "💼" },
  { id: "student", label: "قرض طلابي", emoji: "🎓" },
];

export interface BankProduct {
  loanType: LoanType;
  rate: number; // annual %
  minSalary: number;
  maxAmount: number;
  maxYears: number;
}

export interface Bank {
  id: string;
  name: string;
  nameAr: string;
  short: string; // 2-3 letters for logo
  minAge: number;
  maxAge: number;
  pros: string[];
  cons: string[];
  products: BankProduct[];
}

export const BANKS: Bank[] = [
  {
    id: "bna", name: "BNA", nameAr: "البنك الوطني الجزائري", short: "BNA",
    minAge: 19, maxAge: 70,
    pros: ["تغطية وطنية واسعة", "إجراءات مبسّطة", "خبرة طويلة في القروض العقارية"],
    cons: ["مدة معالجة طويلة أحيانًا", "تتطلب ضمانات قوية"],
    products: [
      { loanType: "real_estate", rate: 6.25, minSalary: 40000, maxAmount: 30000000, maxYears: 25 },
      { loanType: "car", rate: 7.5, minSalary: 30000, maxAmount: 4000000, maxYears: 7 },
      { loanType: "personal", rate: 8.5, minSalary: 25000, maxAmount: 1500000, maxYears: 5 },
      { loanType: "student", rate: 4.0, minSalary: 0, maxAmount: 800000, maxYears: 8 },
    ],
  },
  {
    id: "cpa", name: "CPA", nameAr: "القرض الشعبي الجزائري", short: "CPA",
    minAge: 21, maxAge: 65,
    pros: ["معدلات تنافسية", "خدمة عملاء جيدة", "تمويل سريع للسيارات"],
    cons: ["شروط صارمة للدخل", "رسوم ملف مرتفعة نسبيًا"],
    products: [
      { loanType: "real_estate", rate: 6.5, minSalary: 45000, maxAmount: 25000000, maxYears: 25 },
      { loanType: "car", rate: 7.0, minSalary: 28000, maxAmount: 5000000, maxYears: 7 },
      { loanType: "personal", rate: 9.0, minSalary: 30000, maxAmount: 2000000, maxYears: 5 },
    ],
  },
  {
    id: "bdl", name: "BDL", nameAr: "بنك التنمية المحلية", short: "BDL",
    minAge: 19, maxAge: 70,
    pros: ["دعم المشاريع الصغيرة", "مرونة في الضمانات", "فروع في كل الولايات"],
    cons: ["معدلات أعلى للقروض الشخصية"],
    products: [
      { loanType: "real_estate", rate: 6.75, minSalary: 35000, maxAmount: 20000000, maxYears: 20 },
      { loanType: "car", rate: 7.25, minSalary: 30000, maxAmount: 4500000, maxYears: 6 },
      { loanType: "personal", rate: 9.5, minSalary: 25000, maxAmount: 1200000, maxYears: 4 },
    ],
  },
  {
    id: "bea", name: "BEA", nameAr: "البنك الخارجي الجزائري", short: "BEA",
    minAge: 21, maxAge: 65,
    pros: ["خبرة في التمويل الكبير", "خيارات قروض متنوعة"],
    cons: ["يستهدف الموظفين بدخل مرتفع"],
    products: [
      { loanType: "real_estate", rate: 6.0, minSalary: 60000, maxAmount: 40000000, maxYears: 25 },
      { loanType: "car", rate: 6.75, minSalary: 40000, maxAmount: 6000000, maxYears: 7 },
      { loanType: "personal", rate: 8.0, minSalary: 40000, maxAmount: 2500000, maxYears: 5 },
    ],
  },
  {
    id: "agb", name: "AGB", nameAr: "بنك الخليج الجزائر", short: "AGB",
    minAge: 21, maxAge: 65,
    pros: ["خدمات رقمية متطورة", "معالجة سريعة للملفات"],
    cons: ["شبكة فروع محدودة", "حد أدنى مرتفع للراتب"],
    products: [
      { loanType: "car", rate: 6.5, minSalary: 50000, maxAmount: 5500000, maxYears: 6 },
      { loanType: "personal", rate: 7.5, minSalary: 50000, maxAmount: 3000000, maxYears: 5 },
      { loanType: "real_estate", rate: 6.4, minSalary: 70000, maxAmount: 35000000, maxYears: 25 },
    ],
  },
  {
    id: "sgialgerie", name: "SGA", nameAr: "سوسيتي جنرال الجزائر", short: "SGA",
    minAge: 23, maxAge: 65,
    pros: ["معايير دولية", "تطبيق بنكي حديث"],
    cons: ["متطلبات صارمة", "رسوم أعلى"],
    products: [
      { loanType: "car", rate: 6.9, minSalary: 45000, maxAmount: 5000000, maxYears: 6 },
      { loanType: "personal", rate: 8.25, minSalary: 45000, maxAmount: 2500000, maxYears: 5 },
      { loanType: "real_estate", rate: 6.3, minSalary: 65000, maxAmount: 30000000, maxYears: 25 },
    ],
  },
];

export function monthlyPayment(amount: number, annualRate: number, years: number): number {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) return amount / n;
  return (amount * r) / (1 - Math.pow(1 + r, -n));
}

export function formatDA(n: number): string {
  return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(Math.round(n)) + " دج";
}

export interface RankedOffer {
  bank: Bank;
  product: BankProduct;
  monthly: number;
  totalPayment: number;
  totalInterest: number;
  eligible: boolean;
  reason?: string;
}

export function rankBanks(params: {
  loanType: LoanType;
  salary: number;
  age: number;
  amount: number;
  years: number;
}): RankedOffer[] {
  const offers: RankedOffer[] = [];
  for (const bank of BANKS) {
    const product = bank.products.find((p) => p.loanType === params.loanType);
    if (!product) continue;
    const monthly = monthlyPayment(params.amount, product.rate, params.years);
    const total = monthly * params.years * 12;
    let eligible = true;
    let reason: string | undefined;
    if (params.salary < product.minSalary) { eligible = false; reason = `الراتب الأدنى المطلوب ${formatDA(product.minSalary)}`; }
    else if (params.amount > product.maxAmount) { eligible = false; reason = `المبلغ يفوق الحد الأقصى ${formatDA(product.maxAmount)}`; }
    else if (params.years > product.maxYears) { eligible = false; reason = `أقصى مدة ${product.maxYears} سنة`; }
    else if (params.age < bank.minAge || params.age > bank.maxAge) { eligible = false; reason = `العمر المسموح ${bank.minAge}-${bank.maxAge}`; }
    else if (monthly > params.salary * 0.4) { eligible = false; reason = "القسط يتجاوز 40% من الراتب"; }
    offers.push({ bank, product, monthly, totalPayment: total, totalInterest: total - params.amount, eligible, reason });
  }
  return offers.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return a.product.rate - b.product.rate;
  });
}

export const DOCUMENTS: Record<LoanType, string[]> = {
  real_estate: [
    "بطاقة التعريف الوطنية (نسخة)",
    "شهادة الإقامة",
    "شهادة العمل + كشوف الراتب لآخر 3 أشهر",
    "كشف حساب بنكي لآخر 6 أشهر",
    "وعد بالبيع موثّق",
    "شهادة ملكية البائع",
    "تقييم عقاري من خبير معتمد",
    "شهادة عدم الرهن",
    "تأمين على الحياة",
  ],
  car: [
    "بطاقة التعريف الوطنية",
    "شهادة الإقامة",
    "شهادة العمل + كشوف الراتب لآخر 3 أشهر",
    "كشف حساب بنكي لآخر 3 أشهر",
    "فاتورة مبدئية (Pro-forma) من الوكيل",
    "شهادة عائلية",
    "تأمين شامل على السيارة",
  ],
  personal: [
    "بطاقة التعريف الوطنية",
    "شهادة الإقامة",
    "شهادة العمل + كشوف الراتب لآخر 3 أشهر",
    "كشف حساب بنكي",
    "شهادة عائلية",
  ],
  student: [
    "بطاقة التعريف الوطنية",
    "شهادة التسجيل الجامعي",
    "كفيل (شهادة عمل + كشوف راتب)",
    "بطاقة التعريف للكفيل",
    "شهادة الإقامة",
  ],
};
