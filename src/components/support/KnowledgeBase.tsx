
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search, Eye } from "lucide-react";

export const KnowledgeBase = () => {
  const articles = [
    { id: 1, title: "Como fazer login no sistema", category: "Getting Started", views: 1247, status: "published", lastUpdated: "2024-01-15" },
    { id: 2, title: "Configurando notificações", category: "Configuration", views: 892, status: "published", lastUpdated: "2024-01-10" },
    { id: 3, title: "Exportando dados", category: "Data Management", views: 634, status: "draft", lastUpdated: "2024-01-08" },
    { id: 4, title: "Resolvendo problemas comuns", category: "Troubleshooting", views: 1456, status: "published", lastUpdated: "2024-01-05" }
  ];

  const getCategoryColor = (category: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (category) {
      case "Getting Started": return "default";
      case "Configuration": return "secondary";
      case "Data Management": return "outline";
      case "Troubleshooting": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Base de Conhecimento</h2>
          <p className="text-muted-foreground">Artigos e documentação</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Artigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5K</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Diferentes tópicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6/5</div>
            <p className="text-xs text-muted-foreground">Útil para usuários</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar artigos..." className="pl-10" />
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{article.title}</h3>
                    <Badge variant={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                    <Badge variant={article.status === "published" ? "default" : "outline"}>
                      {article.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views} visualizações
                    </div>
                    <span>Atualizado: {article.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                  <Button size="sm">
                    Ver
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
