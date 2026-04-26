// Lightweight global store (no extra deps) for sharing onboarding form data across routes.
import { useEffect, useState } from "react";
import type { LoanType } from "./banks";

export interface SimInputs {
  loanType: LoanType;
  salary: number;
  age: number;
  amount: number;
  years: number;
  rate?: number;
  bankId?: string;
}

const DEFAULT: SimInputs = {
  loanType: "real_estate",
  salary: 60000,
  age: 30,
  amount: 5000000,
  years: 15,
};

let state: SimInputs = { ...DEFAULT };
const listeners = new Set<() => void>();

export function getInputs(): SimInputs { return state; }
export function setInputs(patch: Partial<SimInputs>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useInputs(): [SimInputs, (p: Partial<SimInputs>) => void] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return [state, setInputs];
}
