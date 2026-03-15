import { Invoice, formatMoney, formatDate } from "@/data/mockData";
import Icon from "@/components/ui/icon";
import StatusBadge from "./StatusBadge";

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoicePdfPreview({ invoice, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden flex flex-col max-h-[95vh]">

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">{invoice.number}.pdf</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-white border border-border px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <Icon name="Download" size={13} />
              Скачать PDF
            </button>
            <button
              className="flex items-center gap-1.5 text-xs font-medium text-background bg-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/80 transition-colors"
            >
              <Icon name="Send" size={13} />
              В Telegram
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors ml-2">
              <Icon name="X" size={15} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* PDF page */}
        <div className="overflow-y-auto flex-1 bg-gray-100 p-6">
          <div
            id="pdf-content"
            className="w-full max-w-[720px] mx-auto bg-white shadow-lg"
            style={{ minHeight: "960px", padding: "56px 64px", fontFamily: "'Golos Text', sans-serif" }}
          >
            {/* Invoice header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px" }}>
              {/* Logo / company */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{
                    width: "36px", height: "36px", background: "#0f1117", borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ color: "white", fontFamily: "Cormorant, serif", fontWeight: 600, fontSize: "18px", lineHeight: 1 }}>S</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em", color: "#0f1117" }}>Sweep</span>
                </div>
                <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                  ИП Петров Юрий Александрович<br />
                  ИНН 771234567890<br />
                  г. Москва, ул. Льва Толстого, 16
                </p>
              </div>

              {/* Invoice meta */}
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f1117", margin: "0 0 4px 0", letterSpacing: "-0.03em" }}>
                  СЧЁТ
                </h1>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0", fontFamily: "monospace" }}>
                  {invoice.number}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Выставлен:</span>
                    <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{formatDate(invoice.createdAt)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Срок оплаты:</span>
                    <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "#e5e7eb", marginBottom: "32px" }} />

            {/* Bill to */}
            <div style={{ marginBottom: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" }}>
                Счёт выставлен для
              </p>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#0f1117", margin: "0 0 4px 0" }}>{invoice.clientName}</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{invoice.clientEmail}</p>
            </div>

            {/* Items table */}
            <div style={{ marginBottom: "32px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #0f1117" }}>
                    <th style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 10px 0" }}>
                      Наименование
                    </th>
                    <th style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 10px 0", width: "80px" }}>
                      Кол.
                    </th>
                    <th style={{ textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 10px 0", width: "120px" }}>
                      Цена
                    </th>
                    <th style={{ textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 0 10px 0", width: "130px" }}>
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "14px 0", fontSize: "14px", color: "#374151" }}>{item.description}</td>
                      <td style={{ padding: "14px 0", fontSize: "14px", color: "#6b7280", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "14px 0", fontSize: "14px", color: "#6b7280", textAlign: "right" }}>{formatMoney(item.price)}</td>
                      <td style={{ padding: "14px 0", fontSize: "14px", fontWeight: 500, color: "#0f1117", textAlign: "right" }}>
                        {formatMoney(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
              <div style={{ minWidth: "260px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Подытог</span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>{formatMoney(invoice.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>НДС (0%)</span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>—</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: "#0f1117", borderRadius: "10px", marginTop: "8px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff" }}>ИТОГО К ОПЛАТЕ</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>{formatMoney(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Note */}
            {invoice.note && (
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "16px", marginBottom: "32px", borderLeft: "3px solid #e5e7eb" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px 0" }}>
                  Примечание
                </p>
                <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>{invoice.note}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 20px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "11px", color: "#d1d5db", margin: 0 }}>Сгенерировано в Sweep · sweep.poehali.dev</p>
              <p style={{ fontSize: "11px", color: "#d1d5db", margin: 0, fontFamily: "monospace" }}>{invoice.number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
