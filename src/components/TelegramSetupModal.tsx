import { useState } from "react";
import Icon from "@/components/ui/icon";

const BOT_URL = "https://functions.poehali.dev/87fff33f-e406-4cec-bf58-4420172e952d";

interface Props {
  onClose: () => void;
}

export default function TelegramSetupModal({ onClose }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const registerWebhook = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${BOT_URL}/?setup=1`);
      const data = await res.json();
      if (data?.webhook?.ok) {
        setStatus("ok");
        setMsg("Webhook успешно зарегистрирован!");
      } else {
        setStatus("err");
        setMsg(data?.webhook?.description || "Ошибка. Проверь токен бота в настройках.");
      }
    } catch (e) {
      setStatus("err");
      setMsg("Ошибка соединения с сервером.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Icon name="Send" size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-foreground">Telegram-бот</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* What bot can */}
          <div className="space-y-2">
            {[
              { icon: "FilePlus", text: "Создавать счета прямо в Telegram" },
              { icon: "Download", text: "Получать готовый PDF с подписью и печатью" },
              { icon: "ToggleLeft", text: "Менять статусы счетов" },
              { icon: "BarChart2", text: "Смотреть статистику" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-foreground">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon name={icon} size={13} className="text-foreground" />
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="bg-secondary/60 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Как подключить</p>
            {[
              "Открой @BotFather в Telegram",
              "Отправь /newbot и следуй инструкции",
              "Скопируй токен и вставь его в Ядро → Секреты → TELEGRAM_BOT_TOKEN",
              "Нажми кнопку ниже для регистрации вебхука",
              "Найди своего бота в Telegram и напиши /start",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
          </div>

          {/* Status */}
          {status === "ok" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <Icon name="CheckCircle2" size={16} />
              {msg}
            </div>
          )}
          {status === "err" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <Icon name="AlertCircle" size={16} />
              {msg}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Закрыть</button>
          <button
            onClick={registerWebhook}
            disabled={status === "loading" || status === "ok"}
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {status === "loading" ? (
              <><Icon name="Loader2" size={14} className="animate-spin" /> Подключаю...</>
            ) : status === "ok" ? (
              <><Icon name="Check" size={14} /> Подключено</>
            ) : (
              <><Icon name="Zap" size={14} /> Зарегистрировать вебхук</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
