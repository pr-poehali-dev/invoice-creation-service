import { history, formatMoney, formatDate } from "@/data/mockData";
import Icon from "@/components/ui/icon";

const channelLabels: Record<string, { label: string; icon: string; cls: string }> = {
  web: { label: "Веб", icon: "Globe", cls: "bg-secondary text-foreground border-border" },
  telegram: { label: "Telegram", icon: "Send", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  api: { label: "API", icon: "Zap", cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

const actionIcons: Record<string, string> = {
  "Счёт оплачен": "CheckCircle2",
  "Счёт отправлен клиенту": "Send",
  "Счёт создан": "FilePlus",
  "Напоминание отправлено в Telegram": "Bell",
  "PDF сгенерирован": "Download",
};

export default function History() {
  const totalEvents = history.length;
  const paid = history.filter(h => h.action === "Счёт оплачен");
  const telegramEvents = history.filter(h => h.channel === "telegram");

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">История</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Все события по счетам</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Событий</p>
          <p className="text-2xl font-semibold text-foreground">{totalEvents}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Оплат</p>
          <p className="text-2xl font-semibold text-green-600">{paid.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatMoney(paid.reduce((s, h) => s + h.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Telegram</p>
          <p className="text-2xl font-semibold text-blue-600">{telegramEvents.length}</p>
          <p className="text-xs text-muted-foreground mt-1">уведомлений</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Лента событий</p>
        </div>
        <div className="divide-y divide-border">
          {[...history].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
            const channel = channelLabels[entry.channel];
            const iconName = actionIcons[entry.action] || "Activity";
            const isPaid = entry.action === "Счёт оплачен";

            return (
              <div key={entry.id} className="flex items-center gap-4 px-4 py-4 hover:bg-secondary/20 transition-colors">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPaid ? "bg-green-100" : "bg-secondary"}`}>
                  <Icon
                    name={iconName}
                    size={16}
                    className={isPaid ? "text-green-600" : "text-muted-foreground"}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{entry.clientName}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="font-mono text-xs text-muted-foreground">{entry.invoiceNumber}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${isPaid ? "text-green-600" : "text-foreground"}`}>
                    {formatMoney(entry.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                </div>

                {/* Channel */}
                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${channel.cls}`}>
                    <Icon name={channel.icon} size={11} />
                    {channel.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telegram CTA */}
      <div className="bg-white rounded-xl border border-border p-6 flex items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Icon name="Send" size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Telegram-бот для уведомлений</p>
          <p className="text-sm text-muted-foreground mt-0.5">Получайте мгновенные уведомления об оплате, создавайте счета голосом и отправляйте PDF клиентам прямо из Telegram</p>
        </div>
        <button className="btn-primary shrink-0">
          <Icon name="Send" size={14} />
          Подключить
        </button>
      </div>
    </div>
  );
}
