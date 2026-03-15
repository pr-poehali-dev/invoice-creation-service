import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Clients from "@/pages/Clients";
import History from "@/pages/History";
import LockScreen, { useAuth } from "@/components/LockScreen";

export default function Index() {
  const { unlocked, unlock } = useAuth();

  if (!unlocked) {
    return <LockScreen onUnlock={unlock} />;
  }

  return (
    <Layout>
      {(page, setPage) => {
        switch (page) {
          case "dashboard":
            return <Dashboard onNavigate={setPage} />;
          case "invoices":
            return <Invoices />;
          case "clients":
            return <Clients />;
          case "history":
            return <History />;
          default:
            return <Dashboard onNavigate={setPage} />;
        }
      }}
    </Layout>
  );
}
