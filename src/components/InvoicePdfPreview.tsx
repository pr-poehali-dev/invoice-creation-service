import { Invoice, formatMoney, formatDate } from "@/data/mockData";
import Icon from "@/components/ui/icon";

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

const LOGO_URL = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/74927180-ad7e-4282-8b42-bb069cf38a4e.png";

const SUPPLIER = {
  name: "ИП ИВЧЕНКО МАРАТ ВАЛЕНТИНОВИЧ",
  inn: "236000378430",
  address: "352129, РОССИЯ, КРАСНОДАРСКИЙ КРАЙ, ТИХОРЕЦКИЙ Р-Н, Г ТИХОРЕЦК, УЛ ФАСТОВЦА, Д 140",
};

const BANK = {
  name: "АО «ТБанк»",
  bik: "044525974",
  corrAccount: "30101810145250000974",
  account: "40802810900008650283",
};

export default function InvoicePdfPreview({ invoice, onClose }: Props) {
  const handlePrint = () => {
    const content = document.getElementById("pdf-content");
    if (!content) return;

    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <title>${invoice.number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Golos Text', sans-serif; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4 portrait; margin: 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>${content.outerHTML}</body>
</html>`);

    win.document.close();
    // Ждём загрузки шрифтов и картинок
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 600);
  };

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
            <button className="flex items-center gap-1.5 text-xs font-medium text-background bg-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/80 transition-colors">
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
            style={{ minHeight: "1040px", padding: "48px 56px", fontFamily: "'Golos Text', sans-serif" }}
          >

            {/* ── HEADER: Logo + Invoice title ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
              <img
                src={LOGO_URL}
                alt="Sweep"
                style={{ height: "38px", objectFit: "contain" }}
              />
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f1117", margin: "0 0 2px 0", letterSpacing: "-0.03em" }}>
                  СЧЁТ НА ОПЛАТУ
                </h1>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 10px 0", fontFamily: "monospace" }}>
                  № {invoice.number}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Дата:</span>
                    <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{formatDate(invoice.createdAt)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Срок оплаты:</span>
                    <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div style={{ height: "2px", background: "#1d4ed8", marginBottom: "28px", borderRadius: "2px" }} />

            {/* ── SUPPLIER + BANK block ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
              {/* Supplier */}
              <div style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: "10px", padding: "16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" }}>
                  Поставщик
                </p>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#0f1117", margin: "0 0 4px 0", lineHeight: 1.4 }}>
                  {SUPPLIER.name}
                </p>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 2px 0" }}>ИНН {SUPPLIER.inn}</p>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
                  {SUPPLIER.address}
                </p>
              </div>

              {/* Bank */}
              <div style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: "10px", padding: "16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" }}>
                  Банк получателя
                </p>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#0f1117", margin: "0 0 6px 0" }}>{BANK.name}</p>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 10px" }}>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>БИК</span>
                  <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500, fontFamily: "monospace" }}>{BANK.bik}</span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>Корр. сч.</span>
                  <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500, fontFamily: "monospace" }}>{BANK.corrAccount}</span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>Сч. №</span>
                  <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500, fontFamily: "monospace" }}>{BANK.account}</span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>ИНН</span>
                  <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500, fontFamily: "monospace" }}>{SUPPLIER.inn}</span>
                </div>
              </div>
            </div>

            {/* ── BILL TO ── */}
            <div style={{ marginBottom: "28px", padding: "14px 16px", background: "#fafafa", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" }}>
                Покупатель
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f1117", margin: "0 0 2px 0" }}>{invoice.clientName}</p>
              {invoice.clientCompany && (
                <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 2px 0" }}>{invoice.clientCompany}</p>
              )}
              {invoice.clientInn && (
                <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 2px 0" }}>ИНН {invoice.clientInn}</p>
              )}
              {invoice.clientAddress && (
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0" }}>{invoice.clientAddress}</p>
              )}
              {invoice.clientEmail && (
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{invoice.clientEmail}</p>
              )}
            </div>

            {/* ── ITEMS TABLE ── */}
            <div style={{ marginBottom: "28px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1d4ed8" }}>
                    <th style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#ffffff", padding: "10px 12px", borderRadius: "0" }}>
                      №
                    </th>
                    <th style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#ffffff", padding: "10px 12px" }}>
                      Наименование товара / услуги
                    </th>
                    <th style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#ffffff", padding: "10px 12px", width: "60px" }}>
                      Кол.
                    </th>
                    <th style={{ textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#ffffff", padding: "10px 12px", width: "110px" }}>
                      Цена
                    </th>
                    <th style={{ textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#ffffff", padding: "10px 12px", width: "120px" }}>
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8faff", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px 12px", fontSize: "12px", color: "#9ca3af" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 12px", fontSize: "13px", color: "#374151" }}>{item.description}</td>
                      <td style={{ padding: "12px 12px", fontSize: "13px", color: "#6b7280", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "12px 12px", fontSize: "13px", color: "#6b7280", textAlign: "right" }}>{formatMoney(item.price)}</td>
                      <td style={{ padding: "12px 12px", fontSize: "13px", fontWeight: 600, color: "#0f1117", textAlign: "right" }}>
                        {formatMoney(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── TOTAL ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
              <div style={{ minWidth: "280px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Подытог</span>
                  <span style={{ fontSize: "12px", color: "#374151" }}>{formatMoney(invoice.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>НДС</span>
                  <span style={{ fontSize: "12px", color: "#374151" }}>Без НДС</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: "#1d4ed8", borderRadius: "10px", marginTop: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>ИТОГО К ОПЛАТЕ</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{formatMoney(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* ── NOTE ── */}
            {invoice.note && (
              <div style={{ background: "#fffbeb", borderRadius: "10px", padding: "14px 16px", marginBottom: "28px", borderLeft: "3px solid #f59e0b" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 5px 0" }}>
                  Примечание
                </p>
                <p style={{ fontSize: "12px", color: "#374151", margin: 0 }}>{invoice.note}</p>
              </div>
            )}

            {/* ── SIGNATURE BLOCK ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "28px", marginTop: "16px" }}>
              {/* Left: подпись + печать */}
              <div>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 4px 0" }}>Руководитель / ИП</p>
                <div style={{ position: "relative", height: "88px" }}>
                  {/* Подпись */}
                  <img
                    src="https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/1e6df93a-5956-48d3-8fda-77ead1406915.png"
                    alt="Подпись"
                    style={{ height: "60px", objectFit: "contain", objectPosition: "left bottom", position: "absolute", bottom: "8px", left: "0px" }}
                  />
                  {/* Печать — перекрывает нижний-правый угол подписи */}
                  <img
                    src="https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/e95b92dd-9ec9-4d53-8c1c-ab83b350edda.png"
                    alt="Печать"
                    style={{ height: "96px", objectFit: "contain", position: "absolute", bottom: "-4px", left: "50px", opacity: 0.85, mixBlendMode: "multiply" }}
                  />
                </div>
                <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "4px" }} />
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>Ивченко М.В.</p>
              </div>
              {/* Right: бухгалтер */}
              <div>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 4px 0" }}>Главный бухгалтер</p>
                <div style={{ height: "88px" }} />
                <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "4px" }} />
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>подпись</p>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "10px", color: "#d1d5db", margin: 0 }}>Создано в Sweep · поставщик: {SUPPLIER.name}</p>
              <p style={{ fontSize: "10px", color: "#d1d5db", margin: 0, fontFamily: "monospace" }}>№ {invoice.number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}