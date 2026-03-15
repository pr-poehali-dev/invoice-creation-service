import { useState, useEffect } from "react";
import { Invoice, InvoiceItem, Client, formatMoney } from "@/data/mockData";
import Icon from "@/components/ui/icon";

interface InvoiceModalProps {
  invoice: Invoice | null;
  clients: Client[];
  onSave: (inv: Invoice) => void;
  onClose: () => void;
}

const emptyItem = (): InvoiceItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  quantity: 1,
  price: 0,
});

export default function InvoiceModal({ invoice, clients, onSave, onClose }: InvoiceModalProps) {
  const [clientId, setClientId] = useState(invoice?.clientId || "");
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || [emptyItem()]);
  const [dueDate, setDueDate] = useState(invoice?.dueDate || "");
  const [note, setNote] = useState(invoice?.note || "");

  const selectedClient = clients.find((c) => c.id === clientId);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!clientId || !dueDate) return;
    const now = new Date().toISOString().split("T")[0];
    const inv: Invoice = {
      id: invoice?.id || Math.random().toString(36).slice(2),
      number: invoice?.number || `СВП-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      clientId,
      clientName: selectedClient?.name || "",
      clientEmail: selectedClient?.email || "",
      items,
      total,
      status: invoice?.status || "draft",
      createdAt: invoice?.createdAt || now,
      dueDate,
      note,
    };
    onSave(inv);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{invoice ? "Редактировать счёт" : "Новый счёт"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Client */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Клиент</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="input-clean"
            >
              <option value="">Выберите клиента</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Срок оплаты</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-clean"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Позиции</label>
              <button onClick={addItem} className="text-xs text-foreground font-medium flex items-center gap-1 hover:opacity-70 transition-opacity">
                <Icon name="Plus" size={12} />
                Добавить
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 text-xs text-muted-foreground px-1">
                <span>Наименование</span>
                <span className="text-center">Кол-во</span>
                <span className="text-right">Цена</span>
                <span></span>
              </div>
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    placeholder="Описание услуги"
                    className="input-clean text-sm"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                    min={1}
                    className="input-clean text-sm text-center"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                    placeholder="0"
                    className="input-clean text-sm text-right"
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-3 flex justify-end">
              <div className="bg-secondary rounded-lg px-4 py-2 text-right">
                <p className="text-xs text-muted-foreground">Итого</p>
                <p className="text-lg font-semibold text-foreground">{formatMoney(total)}</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Примечание</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Комментарий к счёту (необязательно)"
              className="input-clean resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary">Отмена</button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!clientId || !dueDate}
              className="btn-primary disabled:opacity-40"
            >
              <Icon name="Save" size={14} />
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
