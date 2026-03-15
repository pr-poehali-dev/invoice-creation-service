import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "dashboard" | "invoices" | "clients" | "history";

interface LayoutProps {
  children: (page: Page, setPage: (p: Page) => void) => React.ReactNode;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
  { id: "invoices", label: "Счета", icon: "FileText" },
  { id: "clients", label: "Клиенты", icon: "Users" },
  { id: "history", label: "История", icon: "Clock" },
];

export default function Layout({ children }: LayoutProps) {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center group-hover:bg-foreground/80 transition-colors">
              <span className="text-background font-cormorant font-semibold text-sm leading-none">S</span>
            </div>
            <span className="font-golos font-semibold text-foreground text-base tracking-tight">Sweep</span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon name={item.icon} size={15} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <Icon name="Send" size={15} />
              <span className="hidden md:inline text-sm font-medium">Telegram</span>
            </button>
            <button className="w-8 h-8 rounded-full bg-foreground/8 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <span className="text-xs font-semibold text-foreground">Ю</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children(page, setPage)}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">© 2026 Sweep</span>
          <span className="text-xs text-muted-foreground">Генерация счетов и PDF</span>
        </div>
      </footer>
    </div>
  );
}
