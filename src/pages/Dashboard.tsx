import { invoices, clients, formatMoney, formatDate } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import Icon from "@/components/ui/icon";

interface DashboardProps {
  onNavigate: (page: "invoices" | "clients" | "history") => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pending = invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const recent = [...invoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const stats = [
    {
      label: "Получено",
      value: formatMoney(totalRevenue),
      icon: "TrendingUp",
      color: "text-green-600",
      bg: "bg-green-50 border-green-100",
    },
    {
      label: "Ожидается",
      value: formatMoney(pending),
      icon: "Clock",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      label: "Просрочено",
      value: formatMoney(overdue),
      icon: "AlertCircle",
      color: "text-red-600",
      bg: "bg-red-50 border-red-100",
    },
    {
      label: "Клиентов",
      value: String(clients.length),
      icon: "Users",
      color: "text-foreground",
      bg: "bg-secondary border-border",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">15 марта 2026</p>
          <h1 className="text-2xl font-semibold text-foreground">Привет, Юра 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">У тебя {invoices.filter(i => i.status === "overdue").length} просроченных счёта</p>
        </div>
        <button
          onClick={() => onNavigate("invoices")}
          className="btn-primary"
        >
          <Icon name="Plus" size={15} />
          Новый счёт
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
              <Icon name={stat.icon} size={16} className={stat.color} />
            </div>
            <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Последние счета</h2>
            <button
              onClick={() => onNavigate("invoices")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Все счета <Icon name="ArrowRight" size={12} />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {recent.map((inv, idx) => (
              <div
                key={inv.id}
                className={`flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors cursor-pointer ${
                  idx < recent.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon name="FileText" size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.clientName}</p>
                  <p className="text-xs text-muted-foreground">{inv.number} · {formatDate(inv.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{formatMoney(inv.total)}</p>
                  <StatusBadge status={inv.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Быстрые действия</h2>
          <div className="space-y-2">
            {[
              { label: "Создать счёт", sub: "PDF с логотипом", icon: "FilePlus", action: () => onNavigate("invoices") },
              { label: "Добавить клиента", sub: "Новый контрагент", icon: "UserPlus", action: () => onNavigate("clients") },
              { label: "Telegram-бот", sub: "Отправить счёт", icon: "Send", action: () => {} },
              { label: "История операций", sub: "Все события", icon: "Clock", action: () => onNavigate("history") },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-border hover:border-foreground/20 hover:shadow-sm transition-all duration-200 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={15} className="text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>

          {/* Telegram block */}
          <div className="rounded-xl bg-foreground p-4 text-background">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Send" size={15} className="text-background/70" />
              <span className="text-xs font-medium text-background/70 uppercase tracking-wide">Telegram-бот</span>
            </div>
            <p className="text-sm font-medium mb-3">Получайте уведомления и создавайте счета прямо в Telegram</p>
            <button className="w-full bg-white/10 hover:bg-white/20 transition-colors text-background text-sm font-medium py-2 rounded-lg border border-white/20">
              Подключить @sweep_bot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
