export function BankLogo({ short }: { short: string }) {
  return (
    <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center shadow-[var(--shadow-gold)]">
      <span className="font-display font-bold text-gold-foreground text-sm">{short}</span>
    </div>
  );
}
