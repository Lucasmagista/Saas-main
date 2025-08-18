
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const { t } = useTranslation();
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 overflow-hidden">
          <div className="h-full overflow-auto">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </SettingsProvider>
  );
};

export default Layout;
