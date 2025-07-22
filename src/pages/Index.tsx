import { useSettingsContext } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

const Index = () => {
  const { companySettings } = useSettingsContext();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className={cn("flex flex-col items-center justify-center", "opacity-30")}> 
        {companySettings.logo ? (
          <img src={companySettings.logo} alt="Logo" className="w-64 h-64 object-contain mb-4" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-6xl font-bold mb-4">
            SaaS
          </div>
        )}
        <span className="text-2xl font-bold text-muted-foreground"> Empresa {companySettings.name || "SaaS Pro Enterprise"}</span>
      </div>
    </div>
  );
};

export default Index;
