import { Link, useLocation } from "@tanstack/react-router";
import { Home, GitCompare, Calculator, BookOpen, MapPin } from "lucide-react";

const tabs = [
  { to: "/", label: "الرئيسية", icon: Home, exact: true },
  { to: "/compare", label: "مقارنة", icon: GitCompare, exact: false },
  { to: "/simulator", label: "محاكي", icon: Calculator, exact: false },
  { to: "/branches", label: "الفروع", icon: MapPin, exact: false },
  { to: "/guide", label: "دليل", icon: BookOpen, exact: false },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border">
      <div className="mx-auto max-w-md grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                active ? "text-gold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_8px_var(--gold)]" : ""}`} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageShell({ children, hideNav = false }: { children: React.ReactNode; hideNav?: boolean }) {
  return (
    <div className="mx-auto max-w-md min-h-screen pb-24">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
