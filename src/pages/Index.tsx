import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Clients from "@/pages/Clients";
import History from "@/pages/History";
import LockScreen, { useAuth } from "@/components/LockScreen";
import { clients as defaultClients, invoices as defaultInvoices, Client, Invoice } from "@/data/mockData";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch (_e) {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_e) {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default function Index() {
  const { unlocked, unlock } = useAuth();
  const [clients, setClients] = useLocalStorage<Client[]>("svp_clients", defaultClients);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>("svp_invoices", defaultInvoices);

  if (!unlocked) {
    return <LockScreen onUnlock={unlock} />;
  }

  return (
    <Layout>
      {(page, setPage) => {
        switch (page) {
          case "dashboard":
            return <Dashboard invoices={invoices} clients={clients} onNavigate={setPage} />;
          case "invoices":
            return <Invoices invoices={invoices} setInvoices={setInvoices} clients={clients} />;
          case "clients":
            return <Clients clients={clients} setClients={setClients} />;
          case "history":
            return <History />;
          default:
            return <Dashboard invoices={invoices} clients={clients} onNavigate={setPage} />;
        }
      }}
    </Layout>
  );
}
