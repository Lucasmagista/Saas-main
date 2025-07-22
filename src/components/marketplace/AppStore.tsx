
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Download, Search, Filter, Zap } from "lucide-react";

export const AppStore = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const apps = [
    {
      id: 1,
      name: "Slack Integration",
      description: "Conecte seu workspace do Slack com notificações automáticas",
      category: "Communication",
      rating: 4.8,
      downloads: 12500,
      price: "Grátis",
      developer: "Slack Inc.",
      featured: true
    },
    {
      id: 2,
      name: "Google Analytics Pro",
      description: "Analytics avançado com relatórios personalizados",
      category: "Analytics",
      rating: 4.6,
      downloads: 8900,
      price: "R$ 29/mês",
      developer: "Google",
      featured: false
    },
    {
      id: 3,
      name: "WhatsApp Business",
      description: "Automação completa para WhatsApp Business",
      category: "Communication",
      rating: 4.9,
      downloads: 15600,
      price: "R$ 49/mês",
      developer: "Meta",
      featured: true
    },
    {
      id: 4,
      name: "Stripe Payments",
      description: "Processamento de pagamentos integrado",
      category: "Payments",
      rating: 4.7,
      downloads: 9800,
      price: "Grátis",
      developer: "Stripe",
      featured: false
    }
  ];

  const categories = ["Todos", "Communication", "Analytics", "Payments", "Productivity", "Security"];

  const getCategoryColor = (category: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (category) {
      case "Communication": return "default";
      case "Analytics": return "secondary";
      case "Payments": return "destructive";
      case "Productivity": return "outline";
      case "Security": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Loja de Apps</h2>
          <p className="text-muted-foreground">Extensões e integrações para seu SaaS</p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Desenvolver App
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar aplicativos..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card key={app.id} className={app.featured ? "border-primary" : ""}>
            {app.featured && (
              <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-t-lg">
                Em Destaque
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                  <Badge variant={getCategoryColor(app.category)}>
                    {app.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{app.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {app.downloads.toLocaleString()} downloads
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {app.description}
              </CardDescription>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{app.price}</div>
                  <p className="text-xs text-muted-foreground">por {app.developer}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    Instalar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
