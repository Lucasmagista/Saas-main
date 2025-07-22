
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, Database, Wifi } from "lucide-react";

export const ResourceUsage = () => {
  const resources = [
    { name: "CPU", usage: 68, limit: 100, unit: "%" },
    { name: "Memória RAM", usage: 4.2, limit: 8, unit: "GB" },
    { name: "Armazenamento", usage: 125, limit: 500, unit: "GB" },
    { name: "Largura de Banda", usage: 2.1, limit: 10, unit: "Mbps" }
  ];

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getResourceIcon = (name: string) => {
    switch (name) {
      case "CPU": return <Cpu className="h-4 w-4" />;
      case "Memória RAM": return <HardDrive className="h-4 w-4" />;
      case "Armazenamento": return <Database className="h-4 w-4" />;
      case "Largura de Banda": return <Wifi className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Uso de Recursos</h2>
          <p className="text-muted-foreground">Monitoramento de recursos do sistema</p>
        </div>
        <Button variant="outline">
          <Database className="h-4 w-4 mr-2" />
          Otimizar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {resources.map((resource) => {
          const percentage = (resource.usage / resource.limit) * 100;
          return (
            <Card key={resource.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getResourceIcon(resource.name)}
                  {resource.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {resource.usage} {resource.unit} de {resource.limit} {resource.unit}
                    </span>
                    <span className={`text-lg font-bold ${getUsageColor(percentage)}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
