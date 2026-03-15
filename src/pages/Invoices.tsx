import { useState } from "react";
import { invoices as initialInvoices, Invoice, InvoiceStatus, statusLabels, formatMoney, formatDate, clients } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import Icon from "@/components/ui/icon";
import InvoiceModal from "@/components/InvoiceModal";
import InvoicePdfPreview from "@/components/InvoicePdfPreview";

const filterOptions: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "draft", label: "Черновики" },
  { value: "sent", label: "Отправлены" },
  { value: "paid", label: "Оплачены" },
  { value: "overdue", label: "Просрочены" },
];

export default function Invoices() {
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPdf, setShowPdf] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchFilter = filter === "all" || inv.status === filter;
    const matchSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSave = (inv: Invoice) => {
    if (editInvoice) {
      setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    } else {
      setInvoices((prev) => [inv, ...prev]);
    }
    setShowModal(false);
    setEditInvoice(null);
  };

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const handleDelete = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Счета</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{invoices.length} счетов · {invoices.filter(i => i.status === "paid").length} оплачено</p>
        </div>
        <button
          onClick={() => { setEditInvoice(null); setShowModal(true); }}
          className="btn-primary"
        >
          <Icon name="Plus" size={15} />
          Новый счёт
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по клиенту или номеру..."
            className="input-clean pl-9"
          />
        </div>
        <div className="flex gap-1 bg-secondary p-1 rounded-lg">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                filter === opt.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="FileSearch" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Счета не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Номер</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Клиент</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Дата</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Срок</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Сумма</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Статус</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-secondary/30 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-mono font-medium text-foreground">{inv.number}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{inv.clientName}</p>
                        <p className="text-xs text-muted-foreground">{inv.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDate(inv.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-sm ${inv.status === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-foreground">{formatMoney(inv.total)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setShowPdf(inv)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="Просмотр PDF"
                        >
                          <Icon name="Eye" size={14} />
                        </button>
                        <button
                          onClick={() => { setEditInvoice(inv); setShowModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                        <div className="relative group">
                          <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                            <Icon name="MoreHorizontal" size={14} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-border shadow-lg z-10 hidden group-hover:block">
                            {(["sent", "paid", "draft", "overdue"] as InvoiceStatus[])
                              .filter(s => s !== inv.status)
                              .map(s => (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(inv.id, s)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors flex items-center gap-2"
                                >
                                  <span>Отметить: {statusLabels[s]}</span>
                                </button>
                              ))}
                            <div className="border-t border-border" />
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <InvoiceModal
          invoice={editInvoice}
          clients={clients}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditInvoice(null); }}
        />
      )}

      {showPdf && (
        <InvoicePdfPreview invoice={showPdf} onClose={() => setShowPdf(null)} />
      )}
    </div>
  );
}
