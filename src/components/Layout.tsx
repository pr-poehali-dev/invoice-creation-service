import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import TelegramSetupModal from "@/components/TelegramSetupModal";

type Page = "dashboard" | "invoices" | "clients" | "history";

interface LayoutProps {
  children: (page: Page, setPage: (p: Page) => void) => React.ReactNode;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Главная",  icon: "LayoutDashboard" },
  { id: "invoices",  label: "Счета",    icon: "FileText" },
  { id: "clients",   label: "Клиенты",  icon: "Users" },
  { id: "history",   label: "История",  icon: "Clock" },
];

export default function Layout({ children }: LayoutProps) {
  const [page, setPage]     = useState<Page>("dashboard");
  const [showTg, setShowTg] = useState(false);

  // Запрос разрешения на уведомления при первом запуске
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border"
              style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => setPage("dashboard")} className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/b3e1fdda-d623-45d7-8576-66d557372c36.png"
              alt="Бухгалтерия"
              className="h-7 object-contain"
            />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
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
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTg(true)}
              className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg"
            >
              <Icon name="Send" size={14} />
              <span className="hidden md:inline">Telegram-бот</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
        {children(page, setPage)}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                page === item.id ? "text-blue-600" : "text-muted-foreground"
              }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                page === item.id ? "bg-blue-50" : ""
              }`}>
                <Icon name={item.icon} size={18} />
                {page === item.id && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showTg && <TelegramSetupModal onClose={() => setShowTg(false)} />}
    </div>
  );
}
