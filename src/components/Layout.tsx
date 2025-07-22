
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/contexts/SettingsContext";

const Layout = () => {
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 transition-all duration-300">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </SettingsProvider>
  );
};

export default Layout;
