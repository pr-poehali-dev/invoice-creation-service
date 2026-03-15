export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientInn?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  note?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  inn?: string;
  address?: string;
  totalInvoices: number;
  totalPaid: number;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  action: string;
  amount: number;
  date: string;
  channel: "web" | "telegram" | "api";
}

export const clients: Client[] = [];

export const invoices: Invoice[] = [];

export const history: HistoryEntry[] = [];

export const statusLabels: Record<InvoiceStatus, string> = {
  draft: "Черновик",
  sent: "Отправлен",
  paid: "Оплачен",
  overdue: "Просрочен",
};

export const formatMoney = (amount: number): string =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });