// Smart Document Wallet — localStorage backed
import { useEffect, useState } from "react";
import type { LoanType } from "./banks";

export type DocStatus = "ready" | "missing" | "expired";

export interface DocDef {
  id: string;
  label: string;
  emoji: string;
  hasExpiry: boolean;
  // Loan types that require this document. "*" means all.
  requiredFor: LoanType[] | "all";
}

export const DOCUMENTS: DocDef[] = [
  { id: "id_card",      label: "بطاقة التعريف الوطنية",       emoji: "🪪", hasExpiry: true,  requiredFor: "all" },
  { id: "residence",    label: "شهادة الإقامة",               emoji: "🏠", hasExpiry: true,  requiredFor: "all" },
  { id: "work_cert",    label: "شهادة العمل",                  emoji: "💼", hasExpiry: false, requiredFor: "all" },
  { id: "salary_3m",    label: "كشف الراتب (3 أشهر)",          emoji: "💵", hasExpiry: false, requiredFor: "all" },
  { id: "bank_6m",      label: "كشف الحساب البنكي (6 أشهر)",   emoji: "🏦", hasExpiry: false, requiredFor: ["real_estate", "car", "personal"] },
  { id: "property",     label: "عقد الملكية / الإيجار",         emoji: "📜", hasExpiry: false, requiredFor: ["real_estate"] },
  { id: "photos",       label: "صور شخصية",                    emoji: "🖼️", hasExpiry: false, requiredFor: "all" },
];

export interface DocEntry {
  status: DocStatus;        // user-set (or derived if expired)
  expiry?: string | null;   // ISO date string
  updatedAt: number;
}

export type WalletState = Record<string, DocEntry>;

const KEY = "bankidz:wallet";

export function loadWallet(): WalletState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as WalletState;
  } catch {
    return {};
  }
}

export function saveWallet(w: WalletState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(w));
    window.dispatchEvent(new CustomEvent("wallet:updated"));
  } catch {
    /* ignore */
  }
}

export function useWallet(): [WalletState, (w: WalletState) => void] {
  const [state, setState] = useState<WalletState>({});
  useEffect(() => {
    setState(loadWallet());
    const onUpdate = () => setState(loadWallet());
    window.addEventListener("wallet:updated", onUpdate);
    return () => window.removeEventListener("wallet:updated", onUpdate);
  }, []);
  const update = (w: WalletState) => {
    saveWallet(w);
    setState(w);
  };
  return [state, update];
}

/** Returns the *effective* status of a document, accounting for expiry. */
export function effectiveStatus(entry: DocEntry | undefined): DocStatus {
  if (!entry) return "missing";
  if (entry.expiry) {
    const exp = new Date(entry.expiry).getTime();
    if (!Number.isNaN(exp) && exp < Date.now()) return "expired";
  }
  return entry.status;
}

/** Days until expiry. Negative if expired. null if no expiry. */
export function daysUntilExpiry(entry: DocEntry | undefined): number | null {
  if (!entry || !entry.expiry) return null;
  const exp = new Date(entry.expiry).getTime();
  if (Number.isNaN(exp)) return null;
  return Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
}

export function isRequired(doc: DocDef, loanType: LoanType): boolean {
  if (doc.requiredFor === "all") return true;
  return doc.requiredFor.includes(loanType);
}

export interface ReadinessResult {
  total: number;
  ready: number;
  missingDocs: DocDef[];
  expiredDocs: DocDef[];
  ratio: number; // 0..1
}

export function computeReadiness(wallet: WalletState, loanType: LoanType): ReadinessResult {
  const required = DOCUMENTS.filter((d) => isRequired(d, loanType));
  const missingDocs: DocDef[] = [];
  const expiredDocs: DocDef[] = [];
  let ready = 0;
  for (const d of required) {
    const eff = effectiveStatus(wallet[d.id]);
    if (eff === "ready") ready += 1;
    else if (eff === "expired") expiredDocs.push(d);
    else missingDocs.push(d);
  }
  return {
    total: required.length,
    ready,
    missingDocs,
    expiredDocs,
    ratio: required.length === 0 ? 1 : ready / required.length,
  };
}
