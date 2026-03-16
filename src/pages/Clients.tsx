import { useState } from "react";
import { Client, formatMoney } from "@/data/mockData";
import Icon from "@/components/ui/icon";

interface Props {
  clients: Client[];
  setClients: (fn: (prev: Client[]) => Client[]) => void;
}

export default function Clients({ clients, setClients }: Props) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Клиенты</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clients.length} контрагентов</p>
        </div>
        <button onClick={() => { setSelected(null); setShowModal(true); }} className="btn-primary">
          <Icon name="UserPlus" size={15} />
          Добавить
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или компании..."
          className="input-clean pl-9"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl border border-border p-5 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 cursor-pointer group"
            onClick={() => { setSelected(client); setShowModal(true); }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                  <span className="text-background text-sm font-semibold">
                    {client.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm leading-tight">{client.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{client.company}</p>
                </div>
              </div>
              <Icon name="ChevronRight" size={14} className="text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Mail" size={12} />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Phone" size={12} />
                <span>{client.phone}</span>
              </div>
              {client.inn && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Hash" size={12} />
                  <span>ИНН {client.inn}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Счетов</p>
                <p className="text-sm font-semibold text-foreground">{client.totalInvoices}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Оплачено</p>
                <p className="text-sm font-semibold text-foreground">{formatMoney(client.totalPaid)}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button
          onClick={() => { setSelected(null); setShowModal(true); }}
          className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-foreground/30 hover:bg-secondary/30 transition-all duration-200 min-h-[200px]"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Icon name="Plus" size={18} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Новый клиент</p>
        </button>
      </div>

      {showModal && (
        <ClientModal
          client={selected}
          onSave={(c) => {
            if (selected) {
              setClients((prev) => prev.map((cl) => cl.id === c.id ? c : cl));
            } else {
              setClients((prev) => [c, ...prev]);
            }
            setShowModal(false);
          }}
          onDelete={(id) => {
            setClients((prev) => prev.filter((cl) => cl.id !== id));
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ClientModal({
  client,
  onSave,
  onDelete,
  onClose,
}: {
  client: Client | null;
  onSave: (c: Client) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Client>>(client || {});

  const update = (field: keyof Client, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const c: Client = {
      id: client?.id || Math.random().toString(36).slice(2),
      name: form.name || "",
      email: form.email || "",
      phone: form.phone || "",
      company: form.company || "",
      inn: form.inn || "",
      address: form.address || "",
      totalInvoices: client?.totalInvoices || 0,
      totalPaid: client?.totalPaid || 0,
      createdAt: client?.createdAt || new Date().toISOString().split("T")[0],
    };
    onSave(c);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">{client ? "Редактировать клиента" : "Новый клиент"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: "name", label: "Имя", placeholder: "Иван Иванов" },
            { key: "company", label: "Компания", placeholder: "ООО Пример" },
            { key: "email", label: "Email", placeholder: "ivan@company.ru" },
            { key: "phone", label: "Телефон", placeholder: "+7 (999) 000-00-00" },
            { key: "inn", label: "ИНН", placeholder: "7712345678" },
            { key: "address", label: "Адрес", placeholder: "г. Москва, ул. Арбат, 1" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>
              <input
                value={(form as Record<string, string>)[key] || ""}
                onChange={(e) => update(key as keyof Client, e.target.value)}
                placeholder={placeholder}
                className="input-clean"
              />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-between">
          {client ? (
            <button
              onClick={() => onDelete(client.id)}
              className="btn-secondary text-red-600 hover:bg-red-50"
            >
              <Icon name="Trash2" size={14} />
              Удалить
            </button>
          ) : (
            <button onClick={onClose} className="btn-secondary">Отмена</button>
          )}
          <button onClick={handleSave} disabled={!form.name || !form.email} className="btn-primary disabled:opacity-40">
            <Icon name="Check" size={14} />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
