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

export const clients: Client[] = [
  {
    id: "c1",
    name: "Алексей Воронов",
    email: "voronov@techcorp.ru",
    phone: "+7 (905) 123-45-67",
    company: "ТехКорп ООО",
    inn: "7701234567",
    address: "г. Москва, ул. Тверская, 18",
    totalInvoices: 5,
    totalPaid: 180000,
    createdAt: "2025-10-12",
  },
  {
    id: "c2",
    name: "Марина Соколова",
    email: "sokolova@design.ru",
    phone: "+7 (916) 234-56-78",
    company: "ДизайнСтудия",
    inn: "7709876543",
    address: "г. Санкт-Петербург, Невский пр., 100",
    totalInvoices: 3,
    totalPaid: 95000,
    createdAt: "2025-11-05",
  },
  {
    id: "c3",
    name: "Дмитрий Козлов",
    email: "kozlov@retail.ru",
    phone: "+7 (903) 345-67-89",
    company: "РетейлГрупп",
    inn: "7712345678",
    address: "г. Казань, ул. Баумана, 42",
    totalInvoices: 8,
    totalPaid: 320000,
    createdAt: "2025-09-20",
  },
  {
    id: "c4",
    name: "Елена Новикова",
    email: "novikova@fintech.ru",
    phone: "+7 (926) 456-78-90",
    company: "ФинТех Решения",
    inn: "7723456789",
    address: "г. Москва, ул. Арбат, 7",
    totalInvoices: 2,
    totalPaid: 0,
    createdAt: "2026-01-15",
  },
];

export const invoices: Invoice[] = [
  {
    id: "inv1",
    number: "СВП-2026-042",
    clientId: "c1",
    clientName: "Алексей Воронов",
    clientEmail: "voronov@techcorp.ru",
    items: [
      { id: "i1", description: "Разработка CRM-системы", quantity: 1, price: 85000 },
      { id: "i2", description: "Настройка интеграций", quantity: 4, price: 8000 },
    ],
    total: 117000,
    status: "paid",
    createdAt: "2026-02-10",
    dueDate: "2026-03-01",
    note: "Оплата по договору №45 от 01.02.2026",
  },
  {
    id: "inv2",
    number: "СВП-2026-041",
    clientId: "c3",
    clientName: "Дмитрий Козлов",
    clientEmail: "kozlov@retail.ru",
    items: [
      { id: "i3", description: "SEO-продвижение (3 месяца)", quantity: 3, price: 25000 },
    ],
    total: 75000,
    status: "overdue",
    createdAt: "2026-01-15",
    dueDate: "2026-02-15",
  },
  {
    id: "inv3",
    number: "СВП-2026-043",
    clientId: "c2",
    clientName: "Марина Соколова",
    clientEmail: "sokolova@design.ru",
    items: [
      { id: "i4", description: "Дизайн лендинга", quantity: 1, price: 45000 },
      { id: "i5", description: "Анимация элементов", quantity: 1, price: 12000 },
    ],
    total: 57000,
    status: "sent",
    createdAt: "2026-03-05",
    dueDate: "2026-03-25",
  },
  {
    id: "inv4",
    number: "СВП-2026-044",
    clientId: "c4",
    clientName: "Елена Новикова",
    clientEmail: "novikova@fintech.ru",
    items: [
      { id: "i6", description: "Консалтинг по автоматизации", quantity: 8, price: 7500 },
    ],
    total: 60000,
    status: "draft",
    createdAt: "2026-03-12",
    dueDate: "2026-04-01",
  },
  {
    id: "inv5",
    number: "СВП-2026-040",
    clientId: "c3",
    clientName: "Дмитрий Козлов",
    clientEmail: "kozlov@retail.ru",
    items: [
      { id: "i7", description: "Техническая поддержка", quantity: 1, price: 18000 },
    ],
    total: 18000,
    status: "paid",
    createdAt: "2026-01-05",
    dueDate: "2026-01-20",
  },
];

export const history: HistoryEntry[] = [
  {
    id: "h1",
    invoiceId: "inv1",
    invoiceNumber: "СВП-2026-042",
    clientName: "Алексей Воронов",
    action: "Счёт оплачен",
    amount: 117000,
    date: "2026-02-28",
    channel: "web",
  },
  {
    id: "h2",
    invoiceId: "inv3",
    invoiceNumber: "СВП-2026-043",
    clientName: "Марина Соколова",
    action: "Счёт отправлен клиенту",
    amount: 57000,
    date: "2026-03-05",
    channel: "telegram",
  },
  {
    id: "h3",
    invoiceId: "inv4",
    invoiceNumber: "СВП-2026-044",
    clientName: "Елена Новикова",
    action: "Счёт создан",
    amount: 60000,
    date: "2026-03-12",
    channel: "web",
  },
  {
    id: "h4",
    invoiceId: "inv2",
    invoiceNumber: "СВП-2026-041",
    clientName: "Дмитрий Козлов",
    action: "Напоминание отправлено в Telegram",
    amount: 75000,
    date: "2026-02-20",
    channel: "telegram",
  },
  {
    id: "h5",
    invoiceId: "inv5",
    invoiceNumber: "СВП-2026-040",
    clientName: "Дмитрий Козлов",
    action: "Счёт оплачен",
    amount: 18000,
    date: "2026-01-18",
    channel: "web",
  },
  {
    id: "h6",
    invoiceId: "inv3",
    invoiceNumber: "СВП-2026-043",
    clientName: "Марина Соколова",
    action: "PDF сгенерирован",
    amount: 57000,
    date: "2026-03-05",
    channel: "web",
  },
];

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
